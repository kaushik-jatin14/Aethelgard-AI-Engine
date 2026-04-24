class BackendError extends Error {
  constructor(message, { code = 'BACKEND_UNAVAILABLE', retryable = true, status = 503 } = {}) {
    super(message);
    this.name = 'BackendError';
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

const isLocalBrowser = () => {
  if (typeof window === 'undefined') return false;

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

const normalizeBaseUrl = (url) => url?.replace(/\/+$/, '') || '';
const ensureApiBase = (url) => {
  const normalized = normalizeBaseUrl(url);
  if (!normalized) return '';
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const getBackendCandidates = () => {
  const envUrl = ensureApiBase(import.meta.env.VITE_BACKEND_URL);
  const sameOriginApi = '/api';
  const localFallbacks = isLocalBrowser()
    ? ['http://127.0.0.1:8000/api', 'http://localhost:8000/api']
    : [];

  return [...new Set([envUrl, sameOriginApi, ...localFallbacks].filter(Boolean))];
};

const parseErrorResponse = async (response) => {
  try {
    const payload = await response.json();
    if (payload?.ok === false && payload?.message) {
      return new BackendError(payload.message, {
        code: payload.code,
        retryable: payload.retryable,
        status: response.status,
      });
    }
  } catch {
    // Fall through to a generic message when the backend response is not JSON.
  }

  return new BackendError(`Backend request failed with status ${response.status}.`, {
    code: 'BACKEND_HTTP_ERROR',
    retryable: response.status >= 500,
    status: response.status,
  });
};

const requestBackend = async (endpoint, options) => {
  let lastError = null;

  for (const baseUrl of getBackendCandidates()) {
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        lastError = await parseErrorResponse(response);
        continue;
      }

      const payload = await response.json();
      if (payload?.ok === false) {
        throw new BackendError(payload.message, {
          code: payload.code,
          retryable: payload.retryable,
          status: response.status,
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof BackendError) {
        lastError = error;
      } else {
        lastError = new BackendError(
          'Aethelgard could not reach the hosted Oracle service.',
          {
            code: 'BACKEND_UNAVAILABLE',
            retryable: true,
            status: 503,
          }
        );
      }
    }
  }

  throw lastError || new BackendError('Aethelgard could not reach the hosted Oracle service.');
};

export const generateGameAction = async (playerAction, currentState, characterData) => {
  if (playerAction.trim().toLowerCase() === '/dev status') {
    return {
      ok: true,
      narrative: `**[SYSTEM DIAGNOSTIC]**\nEngine Status: **LIVE BACKEND MODE**\nThe hosted Oracle route is enabled.\n\n**What will thou do?**\n1. [Continue]`,
      new_state: currentState,
    };
  }

  return requestBackend('/game-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerAction,
      currentState,
      characterData,
    }),
  });
};

export const generateHelpResponse = async (question) => {
  if (question.trim().toLowerCase() === '/dev status') {
    return {
      ok: true,
      action: 'CHAT',
      message: '[SYSTEM DIAGNOSTIC]\nEngine Status: LIVE BACKEND MODE\nThe Gate Keeper route is enabled.',
    };
  }

  return requestBackend('/help-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
};

export const generateWorldBuilderState = async ({
  currentState = {},
  characterData = {},
  selectedRegion = null,
  theme = null,
} = {}) => {
  return requestBackend('/world-builder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentState,
      characterData,
      selectedRegion,
      theme,
    }),
  });
};

export { BackendError };
