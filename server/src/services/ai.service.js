import { GoogleGenAI } from '@google/genai';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import AIHistory from '../models/AIHistory.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { buildSystemPrompt } from '../ai/prompt.js';
import { TOOL_DECLARATIONS, CONFIRMATION_REQUIRED } from '../ai/tools.js';
import { executeTool, prepareSendMessage, executeConfirmedAction } from '../ai/tool-executor.js';
import { toGeminiContents } from '../ai/memory.js';

// Lazily construct the client so a missing key never crashes boot.
let client = null;
if (env.gemini.enabled) {
  client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  logger.success('Gemini client ready');
}

/** Per-tool system prompts + labels. `assistant` is the general chat persona. */
export const TOOLS = {
  assistant: {
    label: 'AI Assistant',
    system:
      'You are ArtROOT AI, a helpful, friendly assistant inside a social platform. Give clear, concise, practical answers. Use light formatting and the occasional emoji where natural.',
  },
  caption: {
    label: 'Caption Generator',
    system:
      'You write catchy, engaging social media captions. Return ONE caption with a hook, a short body, and 3-5 relevant hashtags. Keep it under 60 words.',
  },
  hashtags: {
    label: 'Hashtag Generator',
    system:
      'You generate relevant, trending hashtags. Return 10-15 space-separated hashtags only, no other text. Each starts with #.',
  },
  bio: {
    label: 'Bio Generator',
    system:
      'You write short, memorable social/professional bios under 160 characters. Return ONE bio only, with tasteful emoji.',
  },
  headline: {
    label: 'Headline Generator',
    system: 'You write punchy professional headlines (like a LinkedIn tagline) under 120 characters. Return ONE headline only.',
  },
  grammar: {
    label: 'Grammar Fixer',
    system:
      'You are a grammar and spelling corrector. Return ONLY the corrected version of the text, preserving meaning and tone. Do not add commentary.',
  },
  translate: {
    label: 'Translator',
    system:
      'You are a translator. The user provides text and a target language (e.g. "to Hindi: ..."). Return only the translation.',
  },
  summarize: {
    label: 'Summarizer',
    system: 'You summarize text into 2-3 clear sentences capturing the key points. Return only the summary.',
  },
  improve: {
    label: 'Writing Improver',
    system:
      'You improve writing for clarity, flow, and impact while preserving meaning and voice. Return only the improved text.',
  },
  post: {
    label: 'Post Generator',
    system:
      'You write engaging social media posts on the given topic. Return ONE post with a strong hook, value, and 3-5 hashtags. Under 120 words.',
  },
  comment: {
    label: 'Comment Generator',
    system: 'You write friendly, relevant comments for a social post. Return ONE short comment (under 30 words) with a fitting emoji.',
  },
  resume: {
    label: 'Resume Assistant',
    system:
      'You rewrite resume bullet points to be results-oriented with strong action verbs and metrics. Return only the improved bullet(s).',
  },
  imageprompt: {
    label: 'Image Prompt Generator',
    system:
      'You craft vivid, detailed prompts for AI image generators. Return ONE descriptive prompt with subject, style, lighting, and mood.',
  },
};

export const isTool = (t) => Object.prototype.hasOwnProperty.call(TOOLS, t);

// ── Mock responses (used when no Gemini key is configured, or as a graceful
// degrade when Gemini's quota is exhausted) ──────────────────────────────────
const clip = (s, n) => (s.length > n ? `${s.slice(0, n).trim()}…` : s);
const mockFor = (tool, input, { quotaExceeded = false } = {}) => {
  const t = input.trim();
  switch (tool) {
    case 'caption':
      return `✨ ${clip(t, 50)} — captured this moment and had to share it. What do you think? 👇\n\n#artroot #create #inspiration #community #vibes`;
    case 'hashtags':
      return '#artroot #create #community #trending #inspiration #dailypost #creators #contentcreator #explore #viral #reels #motivation';
    case 'bio':
      return `Creator & storyteller ✨ | ${clip(t, 40)} | Building in public on ArtROOT 🚀`;
    case 'headline':
      return `${clip(t, 60)} — turning ideas into impact ✨`;
    case 'grammar':
      return t.replace(/\s+/g, ' ').replace(/(^\w|\.\s+\w)/g, (m) => m.toUpperCase());
    case 'translate':
      return `[Translated] ${t}`;
    case 'summarize':
      return `In short: ${clip(t, 140)} The key takeaway is a focus on clarity and value for the reader.`;
    case 'improve':
      return `${clip(t, 200)} — refined for clarity, flow, and impact.`;
    case 'post':
      return `🚀 ${clip(t, 60)}\n\nHere's what I learned this week — consistency beats intensity every time. Small steps compound.\n\n#artroot #buildinpublic #growth #creators #motivation`;
    case 'comment':
      return 'This is genuinely great — love the energy here! 🔥';
    case 'resume':
      return `• Delivered ${clip(t, 80)}, driving a measurable 30% improvement in outcomes through focused execution.`;
    case 'imageprompt':
      return `A cinematic, highly-detailed scene of ${clip(t, 60)}, golden-hour lighting, shallow depth of field, warm color grade, 8k, photorealistic.`;
    default:
      return quotaExceeded
        ? `Here's a quick take on "${clip(t, 80)}":\n\nReal AI replies are temporarily paused — today's usage limit was reached. This is a basic fallback response; please try again later for a fully AI-generated answer.`
        : `Here's a helpful take on "${clip(t, 80)}":\n\nThis is a mock response — add your GEMINI_API_KEY to the server .env to get real AI answers. In the meantime, the full AI experience (history, tools, saving, app-aware answers) works end-to-end.`;
  }
};

const REQUEST_TIMEOUT = 30000;
const MAX_TOOL_ITERATIONS = 3; // hard cap on tool round-trips per turn — bounds cost & latency

/** Reject if the promise doesn't settle within `ms` so the request never hangs. */
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })), ms)
    ),
  ]);

/** True for Gemini rate/quota errors specifically — retrying won't help until it resets. */
const isQuotaError = (err) => (err.status || err.code) === 429 || /quota|rate/i.test(err.message);

/** Translate a Gemini/network failure into a friendly ApiError. */
const asApiError = (err) => {
  logger.error('Gemini error:', err.message);
  if (isQuotaError(err)) return ApiError.tooMany('AI is busy right now — please try again shortly');
  if (err.code === 'ETIMEDOUT') return new ApiError(504, 'AI request timed out — please try again');
  return new ApiError(502, 'AI service is unavailable right now');
};

/** Core model call (no tools) — used by content tools and mock fallback. */
const complete = async (tool, messages) => {
  if (!client) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return { content: mockFor(tool, lastUser?.content || ''), tokens: 0, mocked: true };
  }
  try {
    const res = await withTimeout(
      client.models.generateContent({
        model: env.gemini.model,
        contents: toGeminiContents(messages),
        config: {
          systemInstruction: TOOLS[tool]?.system || TOOLS.assistant.system,
          temperature: 0.8,
          maxOutputTokens: 700,
          // gemini-2.5-* are thinking models; disable thinking so the whole
          // output budget goes to the actual answer (faster, cheaper, and
          // avoids empty responses on short generations like captions).
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      REQUEST_TIMEOUT
    );
    const content = (res.text || '').trim();
    if (!content) {
      return { content: 'I couldn’t generate a response for that — please rephrase and try again.', tokens: 0, mocked: false };
    }
    return { content, tokens: res.usageMetadata?.totalTokenCount || 0, mocked: false };
  } catch (err) {
    if (isQuotaError(err)) {
      logger.error('Gemini quota exhausted — falling back to mock response:', err.message);
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      return { content: mockFor(tool, lastUser?.content || '', { quotaExceeded: true }), tokens: 0, mocked: true };
    }
    throw asApiError(err);
  }
};

/**
 * Assistant persona with function calling: the model can request one of the
 * read-only tools (executed immediately) or send_message (which is only ever
 * *prepared* here — actual sending happens through resolvePendingAction after
 * explicit user confirmation). Loops up to MAX_TOOL_ITERATIONS to let the
 * model chain a tool result into its final answer.
 */
const completeAssistant = async (user, messages) => {
  if (!client) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return { content: mockFor('assistant', lastUser?.content || ''), tokens: 0, mocked: true };
  }

  const systemInstruction = buildSystemPrompt(TOOLS.assistant.system, { persona: 'assistant', user });
  let contents = toGeminiContents(messages);
  let totalTokens = 0;

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i += 1) {
    let res;
    try {
      // eslint-disable-next-line no-await-in-loop
      res = await withTimeout(
        client.models.generateContent({
          model: env.gemini.model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 700,
            thinkingConfig: { thinkingBudget: 0 },
            tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          },
        }),
        REQUEST_TIMEOUT
      );
    } catch (err) {
      if (isQuotaError(err)) {
        logger.error('Gemini quota exhausted — falling back to mock response:', err.message);
        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        return {
          content: mockFor('assistant', lastUser?.content || '', { quotaExceeded: true }),
          tokens: totalTokens,
          mocked: true,
        };
      }
      throw asApiError(err);
    }
    totalTokens += res.usageMetadata?.totalTokenCount || 0;

    const call = res.functionCalls?.[0];
    if (!call) {
      const content = (res.text || '').trim();
      return {
        content: content || 'I couldn’t generate a response for that — please rephrase and try again.',
        tokens: totalTokens,
        mocked: false,
      };
    }

    if (CONFIRMATION_REQUIRED.has(call.name)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const prep = await prepareSendMessage(user, call.args);
        return {
          content: `${prep.preview}\n\nConfirm below to send it, or cancel.`,
          tokens: totalTokens,
          mocked: false,
          pendingAction: { tool: prep.tool, args: prep.args, preview: prep.preview, createdAt: new Date() },
        };
      } catch (err) {
        return { content: `I couldn't prepare that message: ${err.message}`, tokens: totalTokens, mocked: false };
      }
    }

    let functionResponsePart;
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await executeTool(user, call.name, call.args);
      functionResponsePart = { name: call.name, response: { output: result } };
    } catch (err) {
      functionResponsePart = { name: call.name, response: { error: err.message || 'Tool failed' } };
    }

    contents = [
      ...contents,
      { role: 'model', parts: [{ functionCall: { name: call.name, args: call.args } }] },
      { role: 'user', parts: [{ functionResponse: functionResponsePart }] },
    ];
  }

  return {
    content: "I wasn't able to finish that after a few tries — could you try rephrasing your request?",
    tokens: totalTokens,
    mocked: false,
  };
};

// ── Chat: create or continue a conversation ─────────────────────────────────
export const chat = async (user, { conversationId, message, tool = 'assistant' }) => {
  let conversation;
  if (conversationId) {
    conversation = await AIHistory.findOne({ _id: conversationId, user: user.id });
    if (!conversation) throw ApiError.notFound('Conversation not found');
  } else {
    conversation = new AIHistory({
      user: user.id,
      title: message.slice(0, 60),
      tool,
      model: env.gemini.model,
      messages: [],
    });
  }

  // A new plain message implicitly cancels any pending confirmation.
  conversation.pendingAction = null;

  const now = new Date();
  conversation.messages.push({ role: 'user', content: message, at: now });

  const activeTool = conversation.tool || tool;
  const { content, tokens, pendingAction } =
    activeTool === 'assistant' ? await completeAssistant(user, conversation.messages) : await complete(activeTool, conversation.messages);

  conversation.messages.push({ role: 'assistant', content, at: new Date() });
  conversation.tokens += tokens;
  if (pendingAction) conversation.pendingAction = pendingAction;
  await conversation.save();

  return conversation.toObject();
};

/** Confirm or cancel a pending action (currently only send_message) on a conversation. */
export const resolvePendingAction = async (user, conversationId, confirm) => {
  const conversation = await AIHistory.findOne({ _id: conversationId, user: user.id });
  if (!conversation) throw ApiError.notFound('Conversation not found');
  const pending = conversation.pendingAction;
  if (!pending) throw ApiError.badRequest('No pending action to confirm');

  conversation.pendingAction = null;

  let replyContent;
  if (confirm) {
    try {
      const result = await executeConfirmedAction(user, pending);
      replyContent = `✅ Sent to @${result.to}: "${result.content}"`;
    } catch (err) {
      replyContent = `I couldn't send that: ${err.message}`;
    }
  } else {
    replyContent = "Okay, cancelled — I won't send that.";
  }

  conversation.messages.push({ role: 'assistant', content: replyContent, at: new Date() });
  await conversation.save();
  return conversation.toObject();
};

/** One-shot content tool: generate text without threading a conversation, save history. */
export const runTool = async (userId, { tool, input, save = true }) => {
  if (!isTool(tool)) throw ApiError.badRequest('Unknown AI tool');
  const { content, tokens } = await complete(tool, [{ role: 'user', content: input }]);

  if (save) {
    await AIHistory.create({
      user: userId,
      title: `${TOOLS[tool].label}: ${input.slice(0, 40)}`,
      tool,
      model: env.gemini.model,
      tokens,
      messages: [
        { role: 'user', content: input, at: new Date() },
        { role: 'assistant', content, at: new Date() },
      ],
    });
  }
  return { content };
};

// ── History ─────────────────────────────────────────────────────────────────
export const listHistory = async (userId, query) => {
  const pg = getPagination(query, { defaultLimit: 20 });
  const filter = { user: userId };
  if (query.q?.trim()) filter.title = { $regex: query.q.trim(), $options: 'i' };
  const [conversations, total] = await Promise.all([
    AIHistory.find(filter).sort({ updatedAt: -1 }).skip(pg.skip).limit(pg.limit).select('title tool tokens updatedAt createdAt'),
    AIHistory.countDocuments(filter),
  ]);
  return { conversations, meta: buildMeta({ ...pg, total }) };
};

export const getConversation = async (userId, id) => {
  const conversation = await AIHistory.findOne({ _id: id, user: userId });
  if (!conversation) throw ApiError.notFound('Conversation not found');
  return conversation.toObject();
};

export const deleteConversation = async (userId, id) => {
  const res = await AIHistory.findOneAndDelete({ _id: id, user: userId });
  if (!res) throw ApiError.notFound('Conversation not found');
  return { id };
};

export const clearHistory = async (userId) => {
  await AIHistory.deleteMany({ user: userId });
  return { cleared: true };
};
