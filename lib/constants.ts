import type { Tone } from './types';

export const APP_NAME = 'MINDTHREAD';
export const APP_TAGLINE = 'your second mind.';

export interface ToneMeta {
  id: Tone;
  label: string;
  blurb: string;
  // accent color for the card's left edge strip
  accent: string;
  // a short instruction injected into the system prompt
  instruction: string;
}

export const TONES: ToneMeta[] = [
  {
    id: 'blunt',
    label: 'Blunt & Direct',
    blurb: 'No sugar coating. Just facts.',
    accent: '#F59E0B',
    instruction:
      'Be blunt, direct, and concise. No sugar-coating. State observations plainly and honestly.',
  },
  {
    id: 'warm',
    label: 'Warm & Gentle',
    blurb: 'Empathetic and soft tone.',
    accent: '#3B82F6',
    instruction:
      'Be warm, empathetic, and gentle. Validate feelings before offering observations. Use a soft, supportive voice.',
  },
  {
    id: 'analytical',
    label: 'Analytical',
    blurb: 'Logic-driven insights.',
    accent: '#A855F7',
    instruction:
      'Be analytical and structured. Focus on patterns, cause-and-effect, and logic-driven insights.',
  },
  {
    id: 'close_friend',
    label: 'Close Friend',
    blurb: 'Conversational and casual.',
    accent: '#2DD4BF',
    instruction:
      'Talk like a close friend. Be casual, conversational, and real. Use everyday language.',
  },
];

export function toneMeta(tone: Tone): ToneMeta {
  return TONES.find((t) => t.id === tone) ?? TONES[1];
}

// Emotion -> tailwind-ish color, used for tags/bars across the analysis screens.
export const EMOTION_COLORS: Record<string, string> = {
  anxious: '#F59E0B',
  reflective: '#8B5CF6',
  content: '#22C55E',
  melancholic: '#60A5FA',
  hopeful: '#34D399',
  overwhelmed: '#EF4444',
  calm: '#2DD4BF',
  frustrated: '#F87171',
  grateful: '#FBBF24',
  lonely: '#818CF8',
  excited: '#F472B6',
  tired: '#94A3B8',
};

export function emotionColor(name: string): string {
  return EMOTION_COLORS[name.toLowerCase()] ?? '#8B5CF6';
}

// Entry-card left accent strip, keyed by mood (per the design: high mood =
// green, mid = purple, low = pink). Unprocessed entries get a neutral strip.
export function moodAccent(mood: number | null | undefined): string {
  if (mood == null) return '#3F3F58';
  if (mood >= 7) return '#34D399';
  if (mood >= 4.5) return '#8B5CF6';
  return '#EC4899';
}

// Gemini model used for AI calls when the user hasn't picked one.
// gemini-2.5-flash-lite = Google's most cost-efficient model (GA since 2025-07-22).
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
export const FALLBACK_MODEL = 'gemini-2.5-flash';

// Shown in the model picker before/without a live listModels fetch.
export const COMMON_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

export function resolveModel(model: string | null | undefined): string {
  return model?.trim() || DEFAULT_MODEL;
}
