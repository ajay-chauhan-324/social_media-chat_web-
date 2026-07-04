import { GoogleGenAI } from '@google/genai';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import AIHistory from '../models/AIHistory.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

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

// ── Mock responses (used when no OpenAI key is configured) ──────────────────
const clip = (s, n) => (s.length > n ? `${s.slice(0, n).trim()}…` : s);
const mockFor = (tool, input) => {
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
      return `Here's a helpful take on "${clip(t, 80)}":\n\nThis is a mock response — add your GEMINI_API_KEY to the server .env to get real AI answers. In the meantime, the full AI experience (history, tools, saving) works end-to-end.`;
  }
};

const MAX_CONTEXT = 20; // cap messages sent to the model
const REQUEST_TIMEOUT = 30000;

/** Reject if the promise doesn't settle within `ms` so the request never hangs. */
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })), ms)
    ),
  ]);

/** Map our stored roles to Gemini's contents format ('assistant' → 'model'). */
const toGeminiContents = (messages) =>
  messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_CONTEXT)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

/** Core model call with graceful mock fallback + friendly errors. */
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
      // Empty output usually means a safety block or truncation.
      return { content: 'I couldn’t generate a response for that — please rephrase and try again.', tokens: 0, mocked: false };
    }
    return { content, tokens: res.usageMetadata?.totalTokenCount || 0, mocked: false };
  } catch (err) {
    logger.error('Gemini error:', err.message);
    const status = err.status || err.code;
    if (status === 429 || /quota|rate/i.test(err.message)) {
      throw ApiError.tooMany('AI is busy right now — please try again shortly');
    }
    if (err.code === 'ETIMEDOUT') throw new ApiError(504, 'AI request timed out — please try again');
    throw new ApiError(502, 'AI service is unavailable right now');
  }
};

// ── Chat: create or continue a conversation ─────────────────────────────────
export const chat = async (userId, { conversationId, message, tool = 'assistant' }) => {
  let conversation;
  if (conversationId) {
    conversation = await AIHistory.findOne({ _id: conversationId, user: userId });
    if (!conversation) throw ApiError.notFound('Conversation not found');
  } else {
    conversation = new AIHistory({
      user: userId,
      title: message.slice(0, 60),
      tool,
      model: env.gemini.model,
      messages: [],
    });
  }

  const now = new Date();
  conversation.messages.push({ role: 'user', content: message, at: now });

  const { content, tokens } = await complete(conversation.tool || tool, conversation.messages);
  conversation.messages.push({ role: 'assistant', content, at: new Date() });
  conversation.tokens += tokens;
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
