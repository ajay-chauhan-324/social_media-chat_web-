import { Type } from '@google/genai';

/**
 * Gemini function-calling declarations for the assistant persona. Every tool
 * is executed server-side against the authenticated user only (see
 * tool-executor.js) — the model never touches the database directly and
 * never supplies its own idea of "who the user is".
 */
export const TOOL_DECLARATIONS = [
  {
    name: 'get_current_user_profile',
    description: "Fetch the signed-in user's own profile (name, username, bio, headline, follower/following counts, etc).",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'get_recent_conversations',
    description: "List the signed-in user's most recent conversations (private and group chats) with the other participant, last message preview, and unread count.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.INTEGER, description: 'Max conversations to return (default 5, max 10)' },
      },
    },
  },
  {
    name: 'get_unread_messages_count',
    description: "Return the total number of unread messages across all of the signed-in user's conversations.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'search_users',
    description: 'Search for other users on the platform by name or username.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Name or username to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_conversation',
    description: "Fetch the signed-in user's existing private conversation with a specific other user, including recent messages. Only works if a conversation already exists between them.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        username: { type: Type.STRING, description: 'Username of the other person in the conversation' },
      },
      required: ['username'],
    },
  },
  {
    name: 'send_message',
    description: "Send a private message from the signed-in user to another user. This always requires the user to explicitly confirm in the app UI before it is actually sent — calling this tool only prepares the message for confirmation, it does not send it immediately.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        username: { type: Type.STRING, description: 'Username of the message recipient' },
        content: { type: Type.STRING, description: 'The message text to send' },
      },
      required: ['username', 'content'],
    },
  },
];

/** Tools in this set are never auto-executed — see ai.service.js's tool loop. */
export const CONFIRMATION_REQUIRED = new Set(['send_message']);

export const isKnownTool = (name) => TOOL_DECLARATIONS.some((t) => t.name === name);
