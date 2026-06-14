import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import type { Tone, Entry, ProcessedResult, ChatMessage } from '../types';
import {
  processSystem,
  buildProcessPrompt,
  chatSystem,
  insightsSystem,
  buildInsightsPrompt,
} from './prompts';

// Thrown when the user has not configured a Gemini key.
export class ApiKeyRequiredError extends Error {
  constructor() {
    super('API_KEY_REQUIRED');
  }
}

function client(apiKey: string | null): GoogleGenerativeAI {
  if (!apiKey) throw new ApiKeyRequiredError();
  return new GoogleGenerativeAI(apiKey);
}

const processResultSchema = z.object({
  title: z.string().default('Untitled'),
  summary: z.string().default(''),
  moodScore: z.coerce.number().min(0).max(10).default(5),
  emotions: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
  reflectiveQuestion: z.string().default(''),
  isConcern: z.coerce.boolean().default(false),
  aiAnalysis: z.string().default(''),
  feeling: z.string().default(''),
  ideas: z.array(z.string()).default([]),
  pattern: z
    .object({
      name: z.string(),
      whatIsIt: z.string().default(''),
      evidence: z.array(z.string()).default([]),
      advice: z.string().default(''),
      needsAttention: z.coerce.boolean().default(false),
    })
    .nullable()
    .default(null),
  tasks: z
    .array(
      z.object({
        title: z.string(),
        priority: z.enum(['low', 'normal', 'high']).default('normal'),
      }),
    )
    .default([]),
});

const processResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    moodScore: { type: SchemaType.NUMBER },
    emotions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    themes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    reflectiveQuestion: { type: SchemaType.STRING },
    isConcern: { type: SchemaType.BOOLEAN },
    aiAnalysis: { type: SchemaType.STRING },
    feeling: { type: SchemaType.STRING },
    ideas: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    pattern: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        name: { type: SchemaType.STRING },
        whatIsIt: { type: SchemaType.STRING },
        evidence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        advice: { type: SchemaType.STRING },
        needsAttention: { type: SchemaType.BOOLEAN },
      },
      required: ['name', 'whatIsIt', 'evidence', 'advice', 'needsAttention'],
    },
    tasks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          priority: { type: SchemaType.STRING },
        },
        required: ['title'],
      },
    },
  },
  required: [
    'title',
    'summary',
    'moodScore',
    'emotions',
    'themes',
    'reflectiveQuestion',
    'isConcern',
    'aiAnalysis',
    'feeling',
    'ideas',
    'tasks',
  ],
} as const;

function normalize(list: string[]): string[] {
  return Array.from(
    new Set(list.map((s) => s.trim().toLowerCase()).filter(Boolean)),
  ).slice(0, 4);
}

export async function processEntry(
  apiKey: string | null,
  modelId: string,
  tone: Tone,
  rawDump: string,
): Promise<ProcessedResult> {
  const genAI = client(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: processSystem(tone),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: processResponseSchema as never,
      temperature: 0.7,
    },
  });
  try {
    const result = await model.generateContent(buildProcessPrompt(rawDump));
    const parsed = processResultSchema.parse(
      JSON.parse(result.response.text()),
    );
    return {
      ...parsed,
      moodScore: Math.max(0, Math.min(10, parsed.moodScore)),
      emotions: normalize(parsed.emotions),
      themes: normalize(parsed.themes),
    };
  } catch (err) {
    if (err instanceof ApiKeyRequiredError) throw err;
    console.error('processEntry failed', err);
    throw new Error('AI_FAILED');
  }
}

export async function chatReply(
  apiKey: string | null,
  modelId: string,
  tone: Tone,
  entries: Entry[],
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const genAI = client(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: chatSystem(tone, entries),
    generationConfig: { temperature: 0.8 },
  });
  try {
    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];
    const result = await model.generateContent({ contents });
    return result.response.text().trim();
  } catch (err) {
    if (err instanceof ApiKeyRequiredError) throw err;
    console.error('chatReply failed', err);
    throw new Error('AI_FAILED');
  }
}

const insightsResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    insights: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
        },
        required: ['text'],
      },
    },
  },
  required: ['insights'],
} as const;

const insightsSchema = z.object({
  insights: z
    .array(z.object({ text: z.string(), category: z.string().optional() }))
    .default([]),
});

export async function generateInsights(
  apiKey: string | null,
  modelId: string,
  tone: Tone,
  entries: Entry[],
): Promise<{ text: string; category?: string }[]> {
  const genAI = client(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: insightsSystem(tone),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: insightsResponseSchema as never,
      temperature: 0.8,
    },
  });
  try {
    const result = await model.generateContent(buildInsightsPrompt(entries));
    return insightsSchema.parse(JSON.parse(result.response.text())).insights;
  } catch (err) {
    if (err instanceof ApiKeyRequiredError) throw err;
    console.error('generateInsights failed', err);
    throw new Error('AI_FAILED');
  }
}
