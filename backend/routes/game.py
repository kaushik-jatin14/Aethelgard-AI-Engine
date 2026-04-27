import copy
import hashlib
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
TRAVEL_WORDS = {"travel", "journey", "ride", "go", "move", "venture", "reach", "enter", "cross"}
INVESTIGATION_WORDS = {"search", "investigate", "scout", "study", "inspect", "trace", "follow", "look"}
CONFRONTATION_WORDS = {"fight", "battle", "strike", "slay", "defeat", "challenge", "confront", "seal", "recover", "claim"}
HINT_WORDS = {"hint", "help", "guidance", "clue", "suggest", "recommend"}
EASY_WORDS = {"easy", "easier", "gentle", "lower", "simpler"}
HARD_WORDS = {"hard", "harder", "brutal", "nightmare", "difficult", "deadly"}

REGION_PROFILES = {
    "The Nexus Point": {"biome": "Runic crossroads", "threat": "Rune Wraiths", "faction": "Rift Scholars", "relic": "Nexus Sigil", "npc": "Archivist Selene", "danger": 3},
    "Canyon of Whispers": {"biome": "Echoing blood canyon", "threat": "Echo Phantoms", "faction": "Whisperbound Dead", "relic": "War-echo Horn", "npc": "Captain Tharos", "danger": 4},
    "Ruins of Oakhaven": {"biome": "Collapsed royal ruin", "threat": "Iron-masked soldiers", "faction": "Oakhaven Resistance", "relic": "Council Vault Seal", "npc": "Mira of the Ash", "danger": 4},
    "The Ashen Wastes": {"biome": "Plague-scoured ashland", "threat": "Ash Golems", "faction": "Plague Survivors", "relic": "Ashen Censer", "npc": "Doctor Vael", "danger": 4},
    "Crystal Caves": {"biome": "Resonant crystal caverns", "threat": "Void Shards", "faction": "Exiled Mages", "relic": "Memory Prism", "npc": "Lumen Vey", "danger": 3},
    "The Crimson Peak": {"biome": "War-stained mountain", "threat": "Blood Harpies", "faction": "Peak Sentinels", "relic": "God-King Crown", "npc": "Marshal Korr", "danger": 4},
    "Silent Marsh": {"biome": "Poisoned black swamp", "threat": "Swamp Dragon", "faction": "Marsh Folk", "relic": "Bogheart Totem", "npc": "Nami Reedmother", "danger": 4},
    "The Obsidian Citadel": {"biome": "Dark king fortress", "threat": "Iron Sentinels", "faction": "Malachar's Legion", "relic": "Obsidian Command Key", "npc": "Warden Vark", "danger": 5},
    "Forgotten Grove": {"biome": "Silver-leaf sanctuary", "threat": "Blight Sprites", "faction": "Forest Monks", "relic": "Worldsap Vial", "npc": "Sister Lyra", "danger": 2},
    "The Iron Bridge": {"biome": "Abyssal crossing", "threat": "Chain Wraiths", "faction": "Toll-Master's Guard", "relic": "Bridge Tribute Ledger", "npc": "The Toll-Master", "danger": 3},
    "Valley of Bones": {"biome": "Titan grave valley", "threat": "Revenant Kings", "faction": "Undead Host", "relic": "Vorkan Spine Rune", "npc": "Malakor's Herald", "danger": 5},
    "The Weeping Falls": {"biome": "Upward silver cascades", "threat": "Time Fragments", "faction": "Future Monks", "relic": "Silver Oracle Drop", "npc": "Monk Auren", "danger": 3},
    "Temple of the Void": {"biome": "Lightless void temple", "threat": "Void Creatures", "faction": "Mad Cultists", "relic": "Black Lantern Shard", "npc": "Seer Orun", "danger": 5},
    "The Shimmering Sands": {"biome": "Crystal desert", "threat": "Glass Scorpions", "faction": "Nomad Caravans", "relic": "Sun Map Fragment", "npc": "Caravaner Sia", "danger": 3},
    "Gloomwood Forest": {"biome": "Twilight blackwood", "threat": "Shadow Wolves", "faction": "Hidden Villagers", "relic": "Gloom Lantern", "npc": "Warden Edda", "danger": 4},
    "The Howling Abyss": {"biome": "Meteor-fissure crater", "threat": "Sound Wraiths", "faction": "Deaf Hunters", "relic": "Abyss Resonator", "npc": "Hunter Bren", "danger": 5},
    "Sanctuary of Light": {"biome": "Golden refuge plateau", "threat": "Barrier collapse", "faction": "Holy Knights", "relic": "Radiant Wardstone", "npc": "Sir Galahad", "danger": 2},
    "The Molten Core": {"biome": "Divine forge volcano", "threat": "Fire Drakes", "faction": "Fire-Forged Dwarves", "relic": "Godforge Ember", "npc": "Forgequeen Brynn", "danger": 4},
    "Frozen Tundra": {"biome": "Blizzard wasteland", "threat": "Frost Giants", "faction": "Frost Tribes", "relic": "World Tree Compass", "npc": "Kael Iceborne", "danger": 3},
    "The Whispering Woods": {"biome": "Living memory forest", "threat": "Memory Phantoms", "faction": "Memory Keepers", "relic": "Archivist Bark", "npc": "The Archivist", "danger": 3},
    "Dragon's Roost": {"biome": "Storm dragon peaks", "threat": "Ancient Dragons", "faction": "Storm Clan", "relic": "Tempest Scale", "npc": "Freya Stormborn", "danger": 4},
    "The Sunken City": {"biome": "Drowned royal ruins", "threat": "Deep Leviathan", "faction": "Sunken Spirits", "relic": "Tear of the Depths", "npc": "Queen Neris", "danger": 4},
    "The Clockwork Tower": {"biome": "Mechanical brass spire", "threat": "Clockwork Beasts", "faction": "Tower Intelligence", "relic": "Prime Gear Core", "npc": "Curator IX", "danger": 4},
    "The Blightlands": {"biome": "Spreading decay frontier", "threat": "Blight Beasts", "faction": "Edge Survivors", "relic": "Cure Bloom Seed", "npc": "Healer Rowan", "danger": 5},
    "The Final Gate": {"biome": "Stormbound divine arch", "threat": "Reality Distortions", "faction": "Gate Watchers", "relic": "Aethel Keystone", "npc": "Keeper Sol", "danger": 5},
}


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


class WorldBuilderRequest(BaseModel):
    currentState: dict = Field(default_factory=dict)
    characterData: dict = Field(default_factory=dict)
    theme: str | None = None
    selectedRegion: str | None = None


class QuestStageModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    kind: str
    title: str
    objective: str
    hint: str = ""
    risk: str = ""
    status: str = "locked"
    resolution: str = ""


class QuestChainModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    region: str
    title: str
    arc: str
    reward: str
    urgency: str
    stages: list[QuestStageModel] = Field(default_factory=list)


class RegionIntelModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    location: str
    region_title: str
    biome: str
    danger_level: int
    controlling_force: str
    current_state: str
    quest_hook: str
    notable_npc: str
    relic: str
    connections: list[str] = Field(default_factory=list)


class StoryEntryModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    turn: int
    location: str
    action: str
    consequence: str
    tags: list[str] = Field(default_factory=list)


class StoryMemoryModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    summary: str
    story_flags: list[str] = Field(default_factory=list)
    recent_consequences: list[str] = Field(default_factory=list)
    chronicle: list[StoryEntryModel] = Field(default_factory=list)


class SceneDirectorModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    turn_title: str
    visual_mood: str
    weather: str
    ambient_cue: str
    objective_focus: str
    hazard: str
    world_shift: str
    tension: int = 35
    threat_level: int = 2
    route_options: list[str] = Field(default_factory=list)
    cinematic_tags: list[str] = Field(default_factory=list)


class WorldMapModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    theme: str
    generated_via: str
    world_summary: str
    active_region: str
    regions: list[RegionIntelModel] = Field(default_factory=list)
    map_directives: list[str] = Field(default_factory=list)


class WorldBuilderPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    generated_map: WorldMapModel
    quest_chain: QuestChainModel
    story_memory: StoryMemoryModel
    dynamic_scene: SceneDirectorModel


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


def error_response(code: str, message: str, status_code: int, retryable: bool) -> JSONResponse:
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
    difficulty = str(character.get("difficulty") or character.get("currentDifficulty") or "wardens-trial")
    difficulty_guide = {
        "pilgrims-grace": "Be generous with hints, recovery, and clear options. Keep encounters forgiving.",
        "wardens-trial": "Balance danger, mystery, and support. Let skill matter without being cruel.",
        "abyssforged-doom": "Lean into peril, harsher costs, and more punishing consequences.",
    }.get(difficulty, "Balance danger, mystery, and support. Let skill matter without being cruel.")

    return f"""You are the Ancient Oracle of Aethelgard, an AI Game Master. Speak as a wise, cryptic elder narrator.

CHAMPION: {name} | {title} | Weapon: {weapon} | Base: {loc}
MISSION: {mission}
STATS: STR:{stats.get('strength')} AGI:{stats.get('agility')} MAG:{stats.get('magic')} STEALTH:{stats.get('stealth')}
DIFFICULTY: {difficulty} | GUIDE: {difficulty_guide}

LORE: Elder God Aethel shattered himself into 8 champions to stop the Dark King Malachar from unmaking creation. Only reuniting at The Final Gate can restore Aethel.

VALID LOCATIONS (pick EXACTLY one): {LOCATIONS_STR}

SPECIAL BEHAVIOR:
- If the player asks for a hint, provide a useful in-world hint tied to the active quest or region.
- If the player asks to make the game easier or harder, acknowledge the shift in-world and reflect it in the tone of the options.
- Keep the pacing brisk and avoid overly long exposition.

OUTPUT RULES - Return ONLY this raw JSON (no markdown):
{{"narrative":"2-4 poetic sentences. Bold **key words**. End with:\\n\\n**What will thou do?**\\n1. [choice]\\n2. [choice]\\n3. [choice]","new_state":{{"location":"exact name","inventory":[],"health":100,"quests":[],"health_change_reason":""}}}}"""


def get_world_builder_prompt(theme: str, character: dict, current_state: dict, selected_region: str) -> str:
    memory = normalize_story_memory(current_state.get("story_memory"))
    active_region = selected_region if selected_region in VALID_LOCATIONS else current_state.get("location", "The Nexus Point")
    return f"""You are the World-Forge of Aethelgard. Return ONLY valid JSON.

Theme: {theme}
Champion: {character.get("name", "Champion")} | {character.get("title", "")}
Mission: {character.get("mission", "")}
Active region: {active_region}
Known memories: {json.dumps(memory)}
Current state: {json.dumps(current_state)}

Use only these exact region names: {LOCATIONS_STR}

JSON contract:
{{
  "generated_map": {{
    "theme": "string",
    "generated_via": "ai-enhanced",
    "world_summary": "2-3 sentence summary",
    "active_region": "one valid location",
    "map_directives": ["3 short design directions"],
    "regions": [
      {{
        "location": "valid location",
        "region_title": "short evocative title",
        "biome": "string",
        "danger_level": 1,
        "controlling_force": "string",
        "current_state": "string",
        "quest_hook": "string",
        "notable_npc": "string",
        "relic": "string",
        "connections": ["up to 3 valid locations"]
      }}
    ]
  }},
  "quest_chain": {{
    "region": "valid location",
    "title": "string",
    "arc": "string",
    "reward": "string",
    "urgency": "string",
    "stages": [
      {{"id": "stage-1", "kind": "travel|investigate|confront", "title": "string", "objective": "string", "hint": "string", "risk": "string", "status": "active|locked|completed", "resolution": ""}}
    ]
  }},
  "story_memory": {{
    "summary": "2 sentence recap",
    "story_flags": ["up to 5 short flags"],
    "recent_consequences": ["up to 4 short lines"],
    "chronicle": [
      {{"turn": 1, "location": "valid location", "action": "string", "consequence": "string", "tags": ["string"]}}
    ]
  }},
  "dynamic_scene": {{
    "turn_title": "short evolving scene title",
    "visual_mood": "watchful|tense|volatile|cataclysmic|resolute",
    "weather": "short atmospheric condition",
    "ambient_cue": "1 sentence sensory cue",
    "objective_focus": "short objective focus",
    "hazard": "1 sentence warning",
    "world_shift": "1 sentence describing how the world is changing",
    "tension": 1,
    "threat_level": 1,
    "route_options": ["3 concise route prompts"],
    "cinematic_tags": ["up to 5 short tags"]
  }}
}}"""


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


def call_with_timeout(api_key: str, system_instruction: str, prompt: str, model_name: str, timeout: int = 20) -> str:
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


def call_with_model_plan(
    system_instruction: str,
    prompt: str,
    models_to_try: list[str],
    *,
    timeout: int,
    key_limit: int | None = None,
    exhausted_cache: set | None = None,
) -> str:
    raise_if_unconfigured()
    keys = get_configured_keys()
    if key_limit is not None:
        keys = keys[:key_limit]

    last_error = None

    for model in models_to_try:
        for key_index, key in enumerate(keys):
            combo = (model, key[-8:])
            if exhausted_cache is not None and combo in exhausted_cache:
                logger.warning("Skipping exhausted combo model=%s key=...%s", model, key[-8:])
                continue

            try:
                logger.info("Trying model=%s key_index=%s timeout=%s", model, key_index, timeout)
                return call_with_timeout(key, system_instruction, prompt, model, timeout=timeout)
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
                if classified.code == "AI_QUOTA_EXHAUSTED" and exhausted_cache is not None:
                    exhausted_cache.add(combo)
                if classified.code in {"AI_AUTH_INVALID", "AI_MODEL_UNAVAILABLE"}:
                    break
                time.sleep(0.15 + (key_index * 0.08))

    if last_error:
        raise last_error

    raise AIServiceError(
        code="AI_UPSTREAM_FAILURE",
        message="The Oracle service did not return a usable answer.",
        status_code=status.HTTP_502_BAD_GATEWAY,
        retryable=True,
    )


def call_with_fallback(system_instruction: str, prompt: str) -> str:
    return call_with_model_plan(
        system_instruction,
        prompt,
        [
            "gemini-2.0-flash-lite",
            "gemini-2.5-flash",
            "gemini-flash-latest",
        ],
        timeout=6,
        exhausted_cache=EXHAUSTED_COMBOS,
    )


def call_world_builder_ai(system_instruction: str, prompt: str) -> str:
    return call_with_model_plan(
        system_instruction,
        prompt,
        ["gemini-2.0-flash-lite", "gemini-2.5-flash"],
        timeout=3,
        key_limit=1,
    )


def normalize_story_memory(value: dict | None) -> dict:
    base = {
        "summary": "No enduring consequences have been recorded yet.",
        "story_flags": [],
        "recent_consequences": [],
        "chronicle": [],
    }
    if not isinstance(value, dict):
        return base

    normalized = {**base, **value}
    normalized["story_flags"] = [str(flag) for flag in normalized.get("story_flags", [])][:8]
    normalized["recent_consequences"] = [str(line) for line in normalized.get("recent_consequences", [])][-5:]
    chronicle = []
    for entry in normalized.get("chronicle", [])[-10:]:
        if isinstance(entry, dict):
            chronicle.append(
                {
                    "turn": int(entry.get("turn", len(chronicle) + 1)),
                    "location": entry.get("location", "The Nexus Point"),
                    "action": str(entry.get("action", "")),
                    "consequence": str(entry.get("consequence", "")),
                    "tags": [str(tag) for tag in entry.get("tags", [])][:4],
                }
            )
    normalized["chronicle"] = chronicle
    return normalized


def normalize_dynamic_scene(value: dict | None, location: str = "The Nexus Point") -> dict:
    base = {
        "turn_title": f"Whispers over {location}",
        "visual_mood": "watchful",
        "weather": "ashen wind",
        "ambient_cue": "Low chants and distant iron creaks.",
        "objective_focus": f"Read the omens surrounding {location}.",
        "hazard": "Unknown movement beyond the immediate path.",
        "world_shift": f"The realm is testing the edges of {location}.",
        "tension": 35,
        "threat_level": 2,
        "route_options": [
            f"Scout the hidden paths around {location}.",
            f"Question the locals tied to {location}.",
            f"Prepare for the next omen before pressing deeper.",
        ],
        "cinematic_tags": ["watchful", "embers", "oracle-feed"],
    }
    if not isinstance(value, dict):
        return base

    normalized = {**base, **value}
    normalized["tension"] = max(0, min(100, int(normalized.get("tension", base["tension"]) or base["tension"])))
    normalized["threat_level"] = max(1, min(5, int(normalized.get("threat_level", base["threat_level"]) or base["threat_level"])))
    normalized["route_options"] = [str(item) for item in normalized.get("route_options", []) if str(item).strip()][:3] or base["route_options"]
    normalized["cinematic_tags"] = [str(item) for item in normalized.get("cinematic_tags", []) if str(item).strip()][:5] or base["cinematic_tags"]
    for key in ["turn_title", "visual_mood", "weather", "ambient_cue", "objective_focus", "hazard", "world_shift"]:
        normalized[key] = str(normalized.get(key, base[key]))
    return normalized


def derive_theme(character: dict, current_state: dict, requested_theme: str | None = None) -> str:
    if requested_theme and requested_theme.strip():
        return requested_theme.strip()

    title = character.get("title", "Warden of Aethel")
    mission = character.get("mission", "")
    location = current_state.get("location", character.get("startLocation", "The Nexus Point"))
    return f"{title} forged through {location}, pursuing {mission or 'the restoration of the shattered realm'}"


def region_connections(location: str) -> list[str]:
    index = VALID_LOCATIONS.index(location)
    connections = {
        VALID_LOCATIONS[(index - 1) % len(VALID_LOCATIONS)],
        VALID_LOCATIONS[(index + 1) % len(VALID_LOCATIONS)],
        VALID_LOCATIONS[(index + 5) % len(VALID_LOCATIONS)],
    }
    return [name for name in VALID_LOCATIONS if name in connections][:3]


def stable_variant(seed: str, count: int) -> int:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % count


def build_region_intel(location: str, theme: str, character: dict) -> dict:
    profile = REGION_PROFILES.get(location, REGION_PROFILES["The Nexus Point"])
    title_variants = [
        f"The {profile['relic']} Frontier",
        f"The Siege of {location}",
        f"The Omen of {location}",
    ]
    state_variants = [
        f"{profile['faction']} are bracing for a fresh incursion.",
        f"A hidden power is contesting the {profile['relic']}.",
        f"Rumors say the land is reshaping itself around {character.get('name', 'the champion')}.",
    ]
    quest_variants = [
        f"Secure the {profile['relic']} before {profile['threat']} can claim it.",
        f"Earn the trust of {profile['npc']} and expose the next threat line.",
        f"Uncover why {profile['faction']} believe this region is central to Aethel's restoration.",
    ]
    variant = stable_variant(f"{theme}:{location}:{character.get('name', '')}", 3)
    return {
        "location": location,
        "region_title": title_variants[variant],
        "biome": profile["biome"],
        "danger_level": profile["danger"],
        "controlling_force": profile["faction"],
        "current_state": state_variants[variant],
        "quest_hook": quest_variants[variant],
        "notable_npc": profile["npc"],
        "relic": profile["relic"],
        "connections": region_connections(location),
    }


def build_default_story_flags(character: dict, region: str) -> list[str]:
    return [
        f"chosen-{character.get('name', 'champion').lower().replace(' ', '-')}",
        f"current-region:{region}",
        f"class:{character.get('title', 'wanderer').lower().replace(' ', '-')}",
    ]


def generate_deterministic_map(theme: str, character: dict, current_state: dict) -> dict:
    active_region = current_state.get("location", character.get("startLocation", "The Nexus Point"))
    region_payloads = [build_region_intel(location, theme, character) for location in VALID_LOCATIONS]
    current_profile = REGION_PROFILES.get(active_region, REGION_PROFILES["The Nexus Point"])
    mission = character.get("mission", "restore the balance of Aethelgard")

    return {
        "theme": theme,
        "generated_via": "fallback-structured",
        "world_summary": (
            f"Aethelgard bends around {character.get('name', 'the champion')}, whose path now threads through "
            f"{active_region} and the wider war against {current_profile['threat']}. "
            f"Every region holds a relic, a faction, and a consequence tied to {mission}."
        ),
        "active_region": active_region,
        "regions": region_payloads,
        "map_directives": [
            "Highlight the active region with a living quest pulse.",
            "Show every region as a strategic node with danger, faction, and relic focus.",
            "Treat the realm map as a campaign board, not a static illustration.",
        ],
    }


def generate_deterministic_quest_chain(region: str, character: dict, current_state: dict) -> dict:
    profile = REGION_PROFILES.get(region, REGION_PROFILES["The Nexus Point"])
    class_title = character.get("title", "Wanderer")
    weapon = character.get("weapon", "ancient steel")
    mission = character.get("mission", "restore the realm")
    quest_id_seed = region.lower().replace(" ", "-").replace("'", "")

    return {
        "region": region,
        "title": f"The {profile['relic']} of {region}",
        "arc": f"A three-part campaign through {region} where a {class_title} must outmaneuver {profile['threat']} and reshape the region's fate.",
        "reward": f"{profile['relic']} attuned to {weapon}, plus leverage toward {mission}.",
        "urgency": f"{profile['faction']} will lose ground unless the champion acts within the next turning of the realm.",
        "stages": [
            {
                "id": f"{quest_id_seed}-travel",
                "kind": "travel",
                "title": f"Enter {region}",
                "objective": f"Reach the heart of {region} and make contact with {profile['npc']}.",
                "hint": f"Travel openly if you seek allies, or move cautiously if {profile['threat']} already control the roads.",
                "risk": f"Approaching {region} alerts {profile['threat']}.",
                "status": "active" if current_state.get("location") == region else "active",
                "resolution": "",
            },
            {
                "id": f"{quest_id_seed}-investigate",
                "kind": "investigate",
                "title": f"Uncover the fate of the {profile['relic']}",
                "objective": f"Investigate why {profile['faction']} fear the loss of the {profile['relic']}.",
                "hint": f"Question {profile['npc']} and search for signs of hidden interference.",
                "risk": "False clues may bind the region to a darker future.",
                "status": "locked",
                "resolution": "",
            },
            {
                "id": f"{quest_id_seed}-confront",
                "kind": "confront",
                "title": f"Decide the region's consequence",
                "objective": f"Confront {profile['threat']} and claim the {profile['relic']} in a way that changes the realm.",
                "hint": "Choose whether to destroy, bind, or redeem what holds the land in crisis.",
                "risk": "A rash victory may scar the wider campaign.",
                "status": "locked",
                "resolution": "",
            },
        ],
    }


def generate_memory_summary(memory: dict, active_region: str) -> str:
    if not memory["chronicle"]:
        return f"The campaign has just begun in {active_region}; no permanent choices have been etched into the realm."

    recent = memory["chronicle"][-3:]
    joined = "; ".join(f"Turn {entry['turn']}: {entry['consequence']}" for entry in recent)
    return f"The realm remembers {joined} Active region influence now centers on {active_region}."


def derive_scene_director(current_state: dict, character: dict, location: str, player_action: str = "", narrative: str = "") -> dict:
    profile = REGION_PROFILES.get(location, REGION_PROFILES["The Nexus Point"])
    memory = normalize_story_memory(current_state.get("story_memory"))
    lower_action = (player_action or "").lower()
    lower_narrative = (narrative or "").lower()
    combined = f"{lower_action} {lower_narrative}"

    turn_count = max(1, int(current_state.get("turn_count", 0) or 0))
    base_tension = 28 + (profile["danger"] * 9)
    if any(word in combined for word in TRAVEL_WORDS):
        base_tension += 6
    if any(word in combined for word in INVESTIGATION_WORDS):
        base_tension += 10
    if any(word in combined for word in CONFRONTATION_WORDS):
        base_tension += 18
    if "void" in combined or "gate" in combined:
        base_tension += 8
    if int(current_state.get("health", 100) or 100) < 55:
        base_tension += 8
    tension = max(15, min(100, base_tension))

    weather_options = {
        "Runic crossroads": "runic dust spirals",
        "Echoing blood canyon": "whisperstorms along the cliff face",
        "Collapsed royal ruin": "falling ash through broken halls",
        "Plague-scoured ashland": "toxic cinder gusts",
        "Resonant crystal caverns": "shardlight resonance waves",
        "War-stained mountain": "iron sleet over shattered rock",
        "Poisoned black swamp": "venom mist over dark reeds",
        "Dark king fortress": "obsidian static around the walls",
        "Silver-leaf sanctuary": "soft luminous pollen",
        "Abyssal crossing": "chain-rattling winds",
        "Titan grave valley": "bone dust squalls",
        "Upward silver cascades": "reversed silver spray",
        "Lightless void temple": "void static and cold bloom",
        "Crystal desert": "glass-sand mirages",
        "Twilight blackwood": "shadow fog across the roots",
        "Meteor-fissure crater": "howling pressure waves",
        "Golden refuge plateau": "warm sanctum rays",
        "Divine forge volcano": "molten ember rain",
        "Blizzard wasteland": "knife-cold snowfall",
        "Living memory forest": "memory motes drifting sideways",
        "Storm dragon peaks": "stormflash across the roost",
        "Drowned royal ruins": "tidal ghost mist",
        "Mechanical brass spire": "clockwork vapor pulses",
        "Spreading decay frontier": "blight spores riding the wind",
        "Stormbound divine arch": "reality sparks across the gate",
    }

    mood = "watchful"
    if tension >= 80:
        mood = "cataclysmic"
    elif tension >= 65:
        mood = "volatile"
    elif tension >= 50:
        mood = "tense"
    elif "light" in combined or "heal" in combined:
        mood = "resolute"

    active_chain = current_state.get("quest_chain") or {}
    active_stage = next((stage for stage in active_chain.get("stages", []) if stage.get("status") == "active"), None)
    recent_consequence = memory.get("recent_consequences", [])[-1] if memory.get("recent_consequences") else f"{location} waits for a decisive move."

    route_options = [
        active_stage.get("objective") if active_stage else f"Move on {profile['relic']} before {profile['threat']} regain initiative.",
        f"Seek {profile['npc']} to learn how {profile['faction']} are shifting.",
        f"Probe the route toward {region_connections(location)[0]} and test the wider front.",
    ]

    cinematic_tags = [profile["threat"].lower().replace(" ", "-"), mood, "living-world"]
    if profile["danger"] >= 4:
        cinematic_tags.append("hazard-surge")
    if "memory" in combined:
        cinematic_tags.append("memory-echo")

    return normalize_dynamic_scene(
        {
            "turn_title": f"Turn {turn_count}: {profile['relic']} Stirs",
            "visual_mood": mood,
            "weather": weather_options.get(profile["biome"], "restless atmospheric drift"),
            "ambient_cue": f"{profile['threat']} pressure the region while {profile['faction']} struggle to hold the line.",
            "objective_focus": active_stage.get("title") if active_stage else f"Stabilize {location} before the campaign fractures.",
            "hazard": recent_consequence,
            "world_shift": f"{profile['relic']} is altering {location}; every choice leaves a visible mark on the route ahead.",
            "tension": tension,
            "threat_level": profile["danger"],
            "route_options": route_options,
            "cinematic_tags": cinematic_tags,
        },
        location,
    )


def generate_deterministic_world_payload(current_state: dict, character: dict, theme: str, selected_region: str | None = None) -> dict:
    region = selected_region if selected_region in VALID_LOCATIONS else current_state.get("location", character.get("startLocation", "The Nexus Point"))
    story_memory = normalize_story_memory(current_state.get("story_memory"))
    if not story_memory["story_flags"]:
        story_memory["story_flags"] = build_default_story_flags(character, region)
    story_memory["summary"] = generate_memory_summary(story_memory, region)
    world_map = generate_deterministic_map(theme, character, {**current_state, "location": region})
    quest_chain = generate_deterministic_quest_chain(region, character, current_state)
    seeded_state = {**current_state, "story_memory": story_memory, "quest_chain": quest_chain}
    return {
        "generated_map": world_map,
        "quest_chain": quest_chain,
        "story_memory": story_memory,
        "dynamic_scene": derive_scene_director(seeded_state, character, region),
    }


def sanitize_world_payload(payload: dict, baseline: dict) -> dict:
    generated_map = payload.get("generated_map", {})
    candidate_regions = generated_map.get("regions", [])
    sanitized_regions = []
    baseline_regions = {region["location"]: region for region in baseline["generated_map"]["regions"]}
    for region in candidate_regions:
        location = region.get("location")
        if location not in baseline_regions:
            continue
        merged = {**baseline_regions[location], **region}
        merged["connections"] = [name for name in merged.get("connections", []) if name in VALID_LOCATIONS][:3]
        merged["danger_level"] = max(1, min(5, int(merged.get("danger_level", baseline_regions[location]["danger_level"]))))
        sanitized_regions.append(merged)

    if len(sanitized_regions) < len(VALID_LOCATIONS) // 2:
        sanitized_regions = list(baseline_regions.values())

    quest_chain = payload.get("quest_chain", {})
    baseline_chain = baseline["quest_chain"]
    merged_chain = {**baseline_chain, **quest_chain}
    merged_chain["region"] = merged_chain.get("region") if merged_chain.get("region") in VALID_LOCATIONS else baseline_chain["region"]
    stages = []
    for index, stage in enumerate(merged_chain.get("stages", [])):
        if not isinstance(stage, dict):
            continue
        baseline_stage = baseline_chain["stages"][min(index, len(baseline_chain["stages"]) - 1)]
        merged_stage = {**baseline_stage, **stage}
        merged_stage["status"] = merged_stage.get("status", baseline_stage["status"])
        if merged_stage["status"] not in {"active", "locked", "completed"}:
            merged_stage["status"] = baseline_stage["status"]
        stages.append(merged_stage)
    if not stages:
        stages = baseline_chain["stages"]
    merged_chain["stages"] = stages[:3]

    story_memory = normalize_story_memory({**baseline["story_memory"], **payload.get("story_memory", {})})
    dynamic_scene = normalize_dynamic_scene(payload.get("dynamic_scene"), merged_chain["region"])

    return {
        "generated_map": {
            **baseline["generated_map"],
            **generated_map,
            "active_region": generated_map.get("active_region") if generated_map.get("active_region") in VALID_LOCATIONS else baseline["generated_map"]["active_region"],
            "regions": sanitized_regions,
            "map_directives": [str(item) for item in generated_map.get("map_directives", baseline["generated_map"]["map_directives"])][:4],
        },
        "quest_chain": merged_chain,
        "story_memory": story_memory,
        "dynamic_scene": dynamic_scene,
    }


def build_world_payload(current_state: dict, character: dict, theme: str, selected_region: str | None = None) -> dict:
    baseline = generate_deterministic_world_payload(current_state, character, theme, selected_region)
    if not get_runtime_status()["ai_configured"]:
        return baseline

    try:
        system_instruction = "You are the Aethelgard World-Forge. Respond only with valid JSON following the requested schema."
        prompt = get_world_builder_prompt(theme, character, current_state, selected_region or baseline["generated_map"]["active_region"])
        raw = call_world_builder_ai(system_instruction, prompt)
        parsed = json.loads(raw)
        validated = WorldBuilderPayload.model_validate(parsed).model_dump()
        merged = sanitize_world_payload(validated, baseline)
        merged["generated_map"]["generated_via"] = "ai-enhanced"
        return merged
    except (AIServiceError, json.JSONDecodeError, ValidationError) as exc:
        logger.warning("World builder fell back to deterministic payload: %s", exc)
        return baseline


def summarize_consequence(player_action: str, previous_state: dict, new_state: dict) -> str:
    previous_location = previous_state.get("location", "The Nexus Point")
    current_location = new_state.get("location", previous_location)
    previous_health = int(previous_state.get("health", 100) or 100)
    current_health = int(new_state.get("health", previous_health) or previous_health)
    health_delta = current_health - previous_health

    if current_location != previous_location:
        return f"Moved from {previous_location} to {current_location} after choosing to {player_action.lower()}."
    if health_delta < 0:
        return f"Risk followed the action '{player_action}' and cost {abs(health_delta)} vitality."
    if health_delta > 0:
        return f"The action '{player_action}' restored {health_delta} vitality and shifted momentum."
    return f"The choice '{player_action}' changed the campaign's tone at {current_location}."


def extract_tags(player_action: str, narrative: str, location: str) -> list[str]:
    haystack = f"{player_action} {narrative} {location}".lower()
    tags = []
    for keyword in ["dragon", "void", "memory", "relic", "light", "blight", "king", "gate", "shadow", "forge"]:
        if keyword in haystack:
            tags.append(keyword)
    if not tags:
        tags.append(location.lower().replace(" ", "-"))
    return tags[:4]


def detect_requested_difficulty(player_action: str) -> str | None:
    lowered = player_action.lower()
    if "difficulty" in lowered or "make this" in lowered or "change to" in lowered:
        if any(word in lowered for word in EASY_WORDS):
            return "pilgrims-grace"
        if any(word in lowered for word in HARD_WORDS):
            return "abyssforged-doom"
    return None


def build_hint_flags(player_action: str, current_state: dict) -> list[str]:
    lowered = player_action.lower()
    if any(word in lowered for word in HINT_WORDS):
        hints = ["oracle-hint-requested"]
        active_chain = current_state.get("quest_chain") or {}
        active_stage = next((stage for stage in active_chain.get("stages", []) if stage.get("status") == "active"), None)
        if active_stage and active_stage.get("kind"):
            hints.append(f"hint-{active_stage['kind']}")
        return hints
    return []


def advance_story_memory(current_state: dict, new_state: dict, player_action: str, narrative: str) -> dict:
    previous = normalize_story_memory(current_state.get("story_memory"))
    turn = int(current_state.get("turn_count", 0) or 0) + 1
    consequence = summarize_consequence(player_action, current_state, new_state)
    location = new_state.get("location", current_state.get("location", "The Nexus Point"))
    entry = {
        "turn": turn,
        "location": location,
        "action": player_action,
        "consequence": consequence,
        "tags": extract_tags(player_action, narrative, location),
    }
    chronicle = (previous["chronicle"] + [entry])[-8:]
    meta_flags = build_hint_flags(player_action, current_state)
    requested_difficulty = detect_requested_difficulty(player_action)
    if requested_difficulty:
        meta_flags.append(f"difficulty:{requested_difficulty}")
    flags = list(dict.fromkeys(previous["story_flags"] + [f"current-region:{location}"] + entry["tags"] + meta_flags))[-8:]
    consequences = (previous["recent_consequences"] + [consequence])[-4:]
    updated = {
        "summary": "",
        "story_flags": flags,
        "recent_consequences": consequences,
        "chronicle": chronicle,
    }
    updated["summary"] = generate_memory_summary(updated, location)
    return updated


def advance_quest_chain(existing_chain: dict | None, player_action: str, previous_location: str, new_location: str) -> dict | None:
    if not isinstance(existing_chain, dict) or not existing_chain.get("stages"):
        return existing_chain

    chain = copy.deepcopy(existing_chain)
    action_words = set(player_action.lower().split())
    for index, stage in enumerate(chain["stages"]):
        if stage.get("status") != "active":
            continue

        should_complete = False
        if stage.get("kind") == "travel":
            should_complete = new_location == chain.get("region") or bool(action_words & TRAVEL_WORDS)
        elif stage.get("kind") == "investigate":
            should_complete = new_location == chain.get("region") and bool(action_words & INVESTIGATION_WORDS)
        elif stage.get("kind") == "confront":
            should_complete = bool(action_words & CONFRONTATION_WORDS)

        if should_complete:
            stage["status"] = "completed"
            stage["resolution"] = f"Marked complete after the action '{player_action}'."
            if index + 1 < len(chain["stages"]) and chain["stages"][index + 1].get("status") != "completed":
                chain["stages"][index + 1]["status"] = "active"
            break

    return chain


def merge_world_state(current_state: dict, new_state: dict, player_action: str, narrative: str, character: dict) -> dict:
    merged = {**current_state, **new_state}
    merged["location"] = merged.get("location", current_state.get("location", "The Nexus Point"))
    merged["turn_count"] = int(current_state.get("turn_count", 0) or 0) + 1
    merged["active_region"] = merged["location"]
    merged["difficulty"] = current_state.get("difficulty", "wardens-trial")
    requested_difficulty = detect_requested_difficulty(player_action)
    if requested_difficulty:
        merged["difficulty"] = requested_difficulty
    merged["story_memory"] = advance_story_memory(current_state, merged, player_action, narrative)

    world_map = current_state.get("world_map")
    if not isinstance(world_map, dict):
        world_map = generate_deterministic_map(derive_theme(character, current_state), character, merged)
    world_map["active_region"] = merged["location"]
    merged["world_map"] = world_map

    if current_state.get("quest_chain"):
        merged["quest_chain"] = advance_quest_chain(
            current_state.get("quest_chain"),
            player_action,
            current_state.get("location", "The Nexus Point"),
            merged["location"],
        )

    merged["dynamic_scene"] = derive_scene_director(merged, character, merged["location"], player_action, narrative)

    return merged


def parse_game_action_payload(raw_text: str, current_state: dict, player_action: str, character: dict) -> dict:
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

    merged_state = merge_world_state(current_state, new_state, player_action, validated.narrative, character)

    return {
        "ok": True,
        "narrative": validated.narrative,
        "new_state": merged_state,
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
        return parse_game_action_payload(raw, req.currentState, req.playerAction, req.characterData)
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


@router.post("/world-builder")
async def build_world(req: WorldBuilderRequest):
    try:
        theme = derive_theme(req.characterData, req.currentState, req.theme)
        payload = build_world_payload(req.currentState, req.characterData, theme, req.selectedRegion)
        payload["ok"] = True
        return payload
    except Exception as exc:  # pragma: no cover - safety net
        logger.exception("Unexpected world-builder failure: %s", exc)
        fallback = generate_deterministic_world_payload(req.currentState, req.characterData, derive_theme(req.characterData, req.currentState, req.theme), req.selectedRegion)
        fallback["ok"] = True
        fallback["generated_map"]["generated_via"] = "fallback-recovery"
        return fallback
