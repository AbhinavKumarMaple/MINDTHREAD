import { z } from 'zod';

export const emailSchema = z.string().email().max(200);
export const passwordSchema = z.string().min(8, 'Use at least 8 characters').max(200);

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(1).max(60).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const toneSchema = z.enum(['blunt', 'warm', 'analytical', 'close_friend']);
export const prioritySchema = z.enum(['low', 'normal', 'high']);

export const createEntrySchema = z.object({
  // A new draft starts empty; content is added in the editor before processing.
  rawDump: z.string().max(20000).default(''),
});

export const updateEntrySchema = z.object({
  rawDump: z.string().max(20000).optional(),
  concernStatus: z.enum(['unresolved', 'improving', 'resolved']).optional(),
  patternTried: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  notes: z.string().max(5000).nullish(),
  priority: prioritySchema.optional(),
  dueDate: z.string().datetime().optional(),
  sourceEntryId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  notes: z.string().max(5000).nullish(),
  status: z.enum(['pending', 'done', 'cancelled']).optional(),
  priority: prioritySchema.optional(),
  // ISO datetime to set, or null to clear the due date.
  dueDate: z.string().datetime().nullish(),
});

export const settingsSchema = z.object({
  tone: toneSchema.optional(),
  displayName: z.string().min(1).max(60).optional(),
  geminiApiKey: z.string().max(200).optional(),
  model: z.string().max(100).optional(),
});

export const onboardingSchema = z.object({
  tone: toneSchema,
});

export const chatSendSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
});

// ---- Save payloads: the browser computes the AI result, the server persists it ----

export const processedResultSchema = z.object({
  title: z.string().max(200),
  summary: z.string().max(4000),
  moodScore: z.number().min(0).max(10),
  emotions: z.array(z.string().max(40)).max(10),
  themes: z.array(z.string().max(60)).max(10),
  reflectiveQuestion: z.string().max(1000),
  isConcern: z.boolean(),
  aiAnalysis: z.string().max(4000),
  feeling: z.string().max(2000).default(''),
  ideas: z.array(z.string().max(500)).max(10).default([]),
  pattern: z
    .object({
      name: z.string().max(100),
      whatIsIt: z.string().max(2000),
      evidence: z.array(z.string().max(500)).max(10),
      advice: z.string().max(2000),
      needsAttention: z.boolean(),
    })
    .nullable()
    .default(null),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(300),
        priority: prioritySchema,
      }),
    )
    .max(20),
});

export const chatSaveSchema = z.object({
  sessionId: z.string().optional(),
  userMessage: z.string().min(1).max(4000),
  assistantMessage: z.string().min(1).max(8000),
});

export const insightsSaveSchema = z.object({
  insights: z
    .array(
      z.object({
        text: z.string().min(1).max(2000),
        category: z.string().max(60).optional(),
        basedOn: z.number().int().min(0).optional(),
      }),
    )
    .max(20),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
