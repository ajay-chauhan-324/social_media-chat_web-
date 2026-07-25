/**
 * Short-term conversation memory management. Keeps token usage, cost, and
 * latency bounded by capping how much raw history is ever sent to the model —
 * app context and user context are injected separately per-request (see
 * prompt.js) and are never part of this trimmed window.
 */
const MAX_TURNS = 20; // messages (user+assistant combined), not full history

/** Map our stored roles to Gemini's contents format ('assistant' -> 'model'). */
export const toGeminiContents = (messages) =>
  messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
