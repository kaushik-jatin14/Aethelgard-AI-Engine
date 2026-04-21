import json
import logging
import os
import threading
import time
from typing import Literal

from dotenv import load_dotenv
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from pydantic import BaseModel, ConfigDict, Field, ValidationError

load_dotenv()

logger = logging.getLogger("aethelgard.api")
router = APIRouter()

VALID_LOCATIONS = [
    "The Nexus Point",
    "Canyon of Whispers",
    "Ruins of Oakhaven",
    "The Ashen Wastes",
    "Crystal Caves",
    "The Crimson Peak",
    "Silent Marsh",
    "The Obsidian Citadel",
    "Forgotten Grove",
    "The Iron Bridge",
    "Valley of Bones",
    "The Weeping Falls",
    "Temple of the Void",
    "The Shimmering Sands",
    "Gloomwood Forest",
    "The Howling Abyss",
    "Sanctuary of Light",
    "The Molten Core",
    "Frozen Tundra",
    "The Whispering Woods",
    "Dragon's Roost",
    "The Sunken City",
    "The Clockwork Tower",
    "The Blightlands",
    "The Final Gate",
]

LOCATIONS_STR = ", ".join(VALID_LOCATIONS)
EXHAUSTED_COMBOS = set()
HELP_ACTIONS = {"LOGIN_GUEST", "LOGIN_PIN", "CREATE_PROFILE", "CHAT"}


class AIServiceError(Exception):
    def __init__(self, code: str, message: str, status_code: int, retryable: bool):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable


class GameActionRequest(BaseModel):
    playerAction: str
    currentState: dict
    characterData: dict


class HelpChatRequest(BaseModel):
    question: str


class GameStateModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    location: str = "The Nexus Point"
    inventory: list = Field(default_factory=list)
    health: int = 100
    quests: list = Field(default_factory=list)
    health_change_reason: str = ""


class GameActionPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    narrative: str
    new_state: GameStateModel


class HelpChatPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    action: Literal["LOGIN_GUEST", "LOGIN_PIN", "CREATE_PROFILE", "CHAT"]
    message: str
    pin: str | None = None
    name: str | None = None
    age: str | None = None


def get_configured_keys() -> list[str]:
    primary_key = os.getenv("GEMINI_API_KEY", "").strip()
    fallback_keys = [
        key.strip()
        for key in os.getenv("FALLBACK_KEYS", "").split(",")
        if key.strip()
    ]
    return [key for key in [primary_key] + fallback_keys if key]


def get_runtime_status() -> dict:
    keys = get_configured_keys()
    return {
        "ai_configured": bool(keys),
        "configured_key_count": len(keys),
        "cached_exhausted_combos": len(EXHAUSTED_COMBOS),
    }


def error_response(
    code: str,
    message: str,
    status_code: int,
    retryable: bool,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "ok": False,
            "code": code,
            "message": message,
            "retryable": retryable,
        },
    )


def raise_if_unconfigured() -> None:
    if get_configured_keys():
        return

    raise AIServiceError(
        code="AI_NOT_CONFIGURED",
        message="The Oracle service is not configured on the server.",
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        retryable=False,
    )


def classify_upstream_error(exc: Exception) -> AIServiceError:
    err = str(exc)
    lowered = err.lower()

    if isinstance(exc, TimeoutError) or "timed out" in lowered or "timeout" in lowered:
        return AIServiceError(
            code="AI_TIMEOUT",
            message="The Oracle took too long to answer. Please try again.",
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            retryable=True,
        )

    if "429" in lowered or "resource_exhausted" in lowered or "quota" in lowered:
        return AIServiceError(
            code="AI_QUOTA_EXHAUSTED",
            message="The Oracle is temporarily overloaded. Please try again shortly.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            retryable=True,
        )

    if "401" in lowered or "403" in lowered or "api_key" in lowered:
        return AIServiceError(
            code="AI_AUTH_INVALID",
            message="The Oracle credentials are invalid on the server.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            retryable=False,
        )

    if "404" in lowered or "model_not_found" in lowered or "not found" in lowered:
        return AIServiceError(
            code="AI_MODEL_UNAVAILABLE",
            message="The configured Oracle model is unavailable.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            retryable=False,
        )

    return AIServiceError(
        code="AI_UPSTREAM_FAILURE",
        message="The Oracle service failed to produce a valid answer.",
        status_code=status.HTTP_502_BAD_GATEWAY,
        retryable=True,
    )


def get_system_prompt(character: dict) -> str:
    stats = character.get("stats", {})
    name = character.get("name", "Champion")
    title = character.get("title", "")
    weapon = character.get("weapon", "a weapon")
    loc = character.get("startLocation", "The Nexus Point")
    mission = character.get("mission", "")

    return f"""You are the Ancient Oracle of Aethelgard, an AI Game Master. Speak as a wise, cryptic elder narrator.

CHAMPION: {name} | {title} | Weapon: {weapon} | Base: {loc}
MISSION: {mission}
STATS: STR:{stats.get('strength')} AGI:{stats.get('agility')} MAG:{stats.get('magic')} STEALTH:{stats.get('stealth')}

LORE: Elder God Aethel shattered himself into 8 champions to stop the Dark King Malachar from unmaking creation. Only reuniting at The Final Gate can restore Aethel.

VALID LOCATIONS (pick EXACTLY one): {LOCATIONS_STR}

OUTPUT RULES - Return ONLY this raw JSON (no markdown):
{{"narrative":"2-4 poetic sentences. Bold **key words**. End with:\\n\\n**What will thou do?**\\n1. [choice]\\n2. [choice]\\n3. [choice]","new_state":{{"location":"exact name","inventory":[],"health":100,"quests":[],"health_change_reason":""}}}}"""


def call_gemini(api_key: str, system_instruction: str, prompt: str, model_name: str) -> str:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.75,
        ),
    )

    if response.text:
        return response.text

    if response.candidates and response.candidates[0].content.parts:
        return response.candidates[0].content.parts[0].text

    raise ValueError("Empty response from Gemini")


def call_with_timeout(
    api_key: str,
    system_instruction: str,
    prompt: str,
    model_name: str,
    timeout: int = 20,
) -> str:
    result = {"text": None, "error": None}

    def worker() -> None:
        try:
            result["text"] = call_gemini(api_key, system_instruction, prompt, model_name)
        except Exception as exc:  # pragma: no cover - thread boundary
            result["error"] = exc

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    thread.join(timeout)

    if thread.is_alive():
        raise TimeoutError(f"Model {model_name} timed out after {timeout}s")
    if result["error"]:
        raise result["error"]
    return result["text"]


def call_with_fallback(system_instruction: str, prompt: str) -> str:
    raise_if_unconfigured()
    keys = get_configured_keys()
    models_to_try = [
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
    ]

    last_error = None
    for model in models_to_try:
        for key_index, key in enumerate(keys):
            combo = (model, key[-8:])
            if combo in EXHAUSTED_COMBOS:
                logger.warning("Skipping exhausted combo model=%s key=...%s", model, key[-8:])
                continue

            try:
                logger.info("Trying model=%s key_index=%s", model, key_index)
                text = call_with_timeout(key, system_instruction, prompt, model, timeout=20)
                logger.info("Success model=%s key_index=%s", model, key_index)
                return text
            except Exception as exc:
                classified = classify_upstream_error(exc)
                logger.warning(
                    "Gemini call failed model=%s key_index=%s code=%s retryable=%s detail=%s",
                    model,
                    key_index,
                    classified.code,
                    classified.retryable,
                    str(exc)[:160],
                )
                last_error = classified
                if classified.code == "AI_QUOTA_EXHAUSTED":
                    EXHAUSTED_COMBOS.add(combo)
                if classified.code == "AI_MODEL_UNAVAILABLE":
                    break
                time.sleep(0.35 + (key_index * 0.15))

    if last_error:
        raise last_error

    raise AIServiceError(
        code="AI_UPSTREAM_FAILURE",
        message="The Oracle service did not return a usable answer.",
        status_code=status.HTTP_502_BAD_GATEWAY,
        retryable=True,
    )


def parse_game_action_payload(raw_text: str, current_state: dict) -> dict:
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise AIServiceError(
            code="AI_BAD_RESPONSE",
            message="The Oracle returned unreadable game data.",
            status_code=status.HTTP_502_BAD_GATEWAY,
            retryable=True,
        ) from exc

    try:
        validated = GameActionPayload.model_validate(parsed)
    except ValidationError as exc:
        raise AIServiceError(
            code="AI_BAD_RESPONSE",
            message="The Oracle returned incomplete game data.",
            status_code=status.HTTP_502_BAD_GATEWAY,
            retryable=True,
        ) from exc

    new_state = validated.new_state.model_dump()
    if new_state.get("location") not in VALID_LOCATIONS:
        new_state["location"] = current_state.get("location", "The Nexus Point")

    return {
        "ok": True,
        "narrative": validated.narrative,
        "new_state": new_state,
    }


def parse_help_payload(raw_text: str) -> dict:
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise AIServiceError(
            code="AI_BAD_RESPONSE",
            message="The Gate Keeper returned unreadable guidance.",
            status_code=status.HTTP_502_BAD_GATEWAY,
            retryable=True,
        ) from exc

    try:
        validated = HelpChatPayload.model_validate(parsed)
    except ValidationError as exc:
        raise AIServiceError(
            code="AI_BAD_RESPONSE",
            message="The Gate Keeper returned incomplete guidance.",
            status_code=status.HTTP_502_BAD_GATEWAY,
            retryable=True,
        ) from exc

    payload = validated.model_dump(exclude_none=True)
    payload["ok"] = True
    return payload


@router.post("/game-action")
async def generate_action(req: GameActionRequest):
    try:
        system_instruction = get_system_prompt(req.characterData)
        prompt = f'PLAYER ACTION: "{req.playerAction}"\nSTATE: {json.dumps(req.currentState)}'
        raw = call_with_fallback(system_instruction, prompt)
        return parse_game_action_payload(raw, req.currentState)
    except AIServiceError as exc:
        return error_response(exc.code, exc.message, exc.status_code, exc.retryable)
    except Exception as exc:  # pragma: no cover - safety net
        logger.exception("Unexpected game-action failure: %s", exc)
        return error_response(
            "AI_UPSTREAM_FAILURE",
            "The Oracle encountered an unexpected failure.",
            status.HTTP_502_BAD_GATEWAY,
            True,
        )


@router.post("/help-chat")
async def generate_help_response(req: HelpChatRequest):
    try:
        system_instruction = """You are the Gate Keeper of Aethelgard. Guide travelers. Return ONLY valid JSON, no markdown.
- Guest: {"action":"LOGIN_GUEST","message":"welcome"}
- PIN login: {"action":"LOGIN_PIN","pin":"THE_PIN","message":"welcome"}
- Create profile: {"action":"CREATE_PROFILE","name":"Name","age":"Age","message":"msg"}
- Other: {"action":"CHAT","message":"2-3 sentence ancient response"}"""

        raw = call_with_fallback(system_instruction, req.question)
        payload = parse_help_payload(raw)
        if payload["action"] not in HELP_ACTIONS:
            raise AIServiceError(
                code="AI_BAD_RESPONSE",
                message="The Gate Keeper returned an unknown action.",
                status_code=status.HTTP_502_BAD_GATEWAY,
                retryable=True,
            )
        return payload
    except AIServiceError as exc:
        return error_response(exc.code, exc.message, exc.status_code, exc.retryable)
    except Exception as exc:  # pragma: no cover - safety net
        logger.exception("Unexpected help-chat failure: %s", exc)
        return error_response(
            "AI_UPSTREAM_FAILURE",
            "The Gate Keeper encountered an unexpected failure.",
            status.HTTP_502_BAD_GATEWAY,
            True,
        )
