import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ── Key rotation: primary + fallbacks ──────────────────────────────
_primary_key = os.getenv("GEMINI_API_KEY", "")
_fallback_keys = [k for k in os.getenv("FALLBACK_KEYS", "").split(",") if k.strip()]
_all_keys = [k for k in [_primary_key] + _fallback_keys if k]

VALID_LOCATIONS = [
  'The Nexus Point','Canyon of Whispers','Ruins of Oakhaven','The Ashen Wastes',
  'Crystal Caves','The Crimson Peak','Silent Marsh','The Obsidian Citadel',
  'Forgotten Grove','The Iron Bridge','Valley of Bones','The Weeping Falls',
  'Temple of the Void','The Shimmering Sands','Gloomwood Forest','The Howling Abyss',
  'Sanctuary of Light','The Molten Core','Frozen Tundra','The Whispering Woods',
  "Dragon's Roost",'The Sunken City','The Clockwork Tower','The Blightlands','The Final Gate'
]

AETHELGARD_BIRTH_LORE = """In the age before memory, when only stars existed, 
the Elder God Aethel carved this realm from a dying star, pouring his soul into the land to give it life. 
He then shattered himself into eight divine fragments — each becoming one champion, bound by purpose to 
restore what was lost. For a millennium the realm thrived. Then Malachar — the Dark King, born from Aethel's 
emptiness — arose to reclaim the land for the void. He seeks to unmake all creation and return to star-silence. 
Only when the eight champions reunite at The Final Gate, speaking the Words of Aethel in unison, 
can the Elder God be restored and Malachar's shadow be forever undone."""

AETHELGARD_ENDGAME = """The Final Gate stands between two eternal peaks, wreathed in storm 
and guarded by the immortal Watchers. Each champion must complete three divine trials: 
Trial of Worth, Trial of Sacrifice, and Trial of Unity. 
Only then may they face Malachar in the God-Realm beyond."""

def get_system_prompt(character: dict) -> str:
    stats = character.get("stats", {})
    return f"""You are the Ancient Oracle of Aethelgard — the AI Game Master 
of this ancient lore-based RPG. You speak in the voice of a wise, cryptic elder narrator.

PLAYER CHAMPION:
Name: {character.get('name')} | Title: {character.get('title')}
Weapon: {character.get('weapon')}
Starting Territory: {character.get('startLocation', 'The Nexus Point')}
Lore: {character.get('lore')}
Mission: {character.get('mission')}
Stats: STR:{stats.get('strength')} AGI:{stats.get('agility')} MAG:{stats.get('magic')} STEALTH:{stats.get('stealth')} WEAKNESS:{stats.get('weakness')}

WORLD LORE: {AETHELGARD_BIRTH_LORE}
ENDGAME: {AETHELGARD_ENDGAME}

THE 25 KNOWN LOCATIONS (use EXACTLY one): {', '.join(VALID_LOCATIONS)}

CRITICAL RULES:
1. After your narrative, ALWAYS provide 3 numbered action choices.
2. Write in ancient poetic style. Bold **key dramatic words**. Keep narrative to 2-4 sentences.
3. LOCATION must be exactly one of the 25 valid locations.
4. Return ONLY raw JSON, no markdown fences:
{{
  "narrative": "text...\\n\\n**What will thou do?**\\n1. [Option A]\\n2. [Option B]\\n3. [Option C]",
  "new_state": {{
    "location": "exact location name",
    "inventory": [],
    "health": 100,
    "quests": [],
    "health_change_reason": "reason"
  }}
}}"""

def _call_gemini(api_key: str, system_instruction: str, prompt: str, model_name: str = "gemini-1.5-flash") -> str:
    """Call Gemini API with a specific key and model, return raw text response."""
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
        )
    )
    return response.text

def _call_with_fallback(system_instruction: str, prompt: str) -> str:
    """Try all available keys and models to ensure service continuity."""
    if not _all_keys:
        raise RuntimeError("No API keys configured.")
    
    # Order of models to try
    # Order of models to try (Broadened for region compatibility)
    MODELS_TO_TRY = [
        "gemini-3-flash-preview", 
        "gemini-2.5-flash", 
        "gemini-2.0-flash", 
        "gemini-1.5-flash", 
        "gemini-flash-latest"
    ]
    
    last_error = None
    for model in MODELS_TO_TRY:
        for key in _all_keys:
            try:
                return _call_gemini(key, system_instruction, prompt, model)
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                    print(f"Key/Model ({model}) exhausted, trying next...")
                    last_error = e
                    continue
                elif "404" in err_str or "not found" in err_str.lower():
                    print(f"Model {model} not supported for this key, trying next model...")
                    break # Try next model
                else:
                    print(f"Unexpected error with model {model}: {err_str}")
                    last_error = e
                    continue
    
    raise RuntimeError(f"All API keys and models exhausted. Last error: {last_error}")

class GameActionRequest(BaseModel):
    playerAction: str
    currentState: dict
    characterData: dict

class HelpChatRequest(BaseModel):
    question: str

@router.post("/game-action")
async def generate_action(req: GameActionRequest):
    if not _all_keys:
        return {
            "narrative": "**[Backend: No API Key]** Add GEMINI_API_KEY to backend/.env\n\n**What will thou do?**\n1. [Configure key]",
            "new_state": req.currentState
        }
    try:
        system_instruction = get_system_prompt(req.characterData)
        prompt = f'PLAYER ACTION: "{req.playerAction}"\nCURRENT STATE: {json.dumps(req.currentState, indent=2)}'
        
        raw = _call_with_fallback(system_instruction, prompt)
        parsed = json.loads(raw)
        
        # Enforce valid location
        if parsed.get('new_state') and parsed['new_state'].get('location') not in VALID_LOCATIONS:
            parsed['new_state']['location'] = req.currentState.get('location', 'The Nexus Point')
        return parsed

    except RuntimeError as e:
        # All keys exhausted — return atmospheric mock so game doesn't break
        print(f"All keys exhausted: {e}")
        return {
            "narrative": "The Oracle's voice is momentarily clouded by the shifting ether. **Thy destiny remains unbroken.** Rest for a moment, then continue thy quest.\n\n**What will thou do?**\n1. [Try again]\n2. [Rest and recover]\n3. [Scout the surroundings]",
            "new_state": req.currentState
        }
    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Oracle unavailable. Please try again.")

@router.post("/help-chat")
async def generate_help_response(req: HelpChatRequest):
    if not _all_keys:
        return {"action": "CHAT", "message": "Gate Keeper offline. Add GEMINI_API_KEY to backend/.env"}
    try:
        system_instruction = """You are the Gate Keeper of Aethelgard. You guide travelers and process their entry.
RULES: Always return valid JSON. No markdown.
- Guest entry: {"action": "LOGIN_GUEST", "message": "welcoming message"}
- PIN login: {"action": "LOGIN_PIN", "pin": "THE_PIN", "message": "welcoming message"}  
- Create profile: {"action": "CREATE_PROFILE", "name": "Name", "age": "Age", "message": "message"}
- All other queries: {"action": "CHAT", "message": "2-3 sentence ancient helpful response"}"""

        raw = _call_with_fallback(system_instruction, req.question)
        return json.loads(raw)

    except RuntimeError:
        return {"action": "CHAT", "message": "The Gate Keeper's power is temporarily diminished. Please try again shortly."}
    except Exception as e:
        print(f"Help Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Gate Keeper unavailable.")
