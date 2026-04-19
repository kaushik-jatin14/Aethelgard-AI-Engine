export const getGeminiAPIKey = () => localStorage.getItem('GEMINI_API_KEY') || '';
export const setGeminiAPIKey = (key) => localStorage.setItem('GEMINI_API_KEY', key);

// The URL of our new FastAPI Backend Server
// The URL of our FastAPI Backend Server
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

// ================================================================
// GENERATE GAME ACTION
// ================================================================
export const generateGameAction = async (playerAction, currentState, characterData) => {
  // Developer Diagnostic Command
  if (playerAction.trim().toLowerCase() === '/dev status') {
    return {
      narrative: `**[SYSTEM DIAGNOSTIC]**\nEngine Status: **LIVE BACKEND MODE**\nAll systems operational. The Oracle awaits thy move.\n\n**What will thou do?**\n1. [Acknowledge and Continue]`,
      new_state: currentState
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/game-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerAction,
        currentState,
        characterData
      })
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Backend Error encountered:", error.message);
    return {
      narrative: "The Oracle's true voice is currently clouded by the shifting ether. Please ensure the FastAPI backend is running.\n\n**What will thou do?**\n1. [Try again]\n2. [Rest]",
      new_state: currentState
    };
  }
};

// ================================================================
// HELP CHATBOT (Login page)
// ================================================================
export const generateHelpResponse = async (question) => {
  if (question.trim().toLowerCase() === '/dev status') {
    return { action: "CHAT", message: `[SYSTEM DIAGNOSTIC]\nEngine Status: LIVE BACKEND MODE\nThe Gate Keeper stands ready.` };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/help-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Backend Error encountered:", error.message);
    return { action: "CHAT", message: "The Gate Keeper is unavailable at this moment. Ensure the FastAPI backend is running." };
  }
};
