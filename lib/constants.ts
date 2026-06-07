import type { Tone } from './types';

export const APP_NAME = 'MINDTHREAD';
export const APP_TAGLINE = 'your second mind.';

export interface ToneMeta {
  id: Tone;
  label: string;
  blurb: string;
  // a short instruction injected into the system prompt
  instruction: string;
}

export const TONES: ToneMeta[] = [
  {
    id: 'blunt',
    label: 'Blunt & Direct',
    blurb: 'No sugar coating. Just facts.',
    instruction:
      'Be blunt, direct, and concise. No sugar-coating. State observations plainly and honestly.',
  },
  {
    id: 'warm',
    label: 'Warm & Gentle',
    blurb: 'Empathetic and easy to talk to.',
    instruction:
      'Be warm, empathetic, and gentle. Validate feelings before offering observations. Use a soft, supportive voice.',
  },
  {
    id: 'analytical',
    label: 'Analytical',
    blurb: 'Logic-driven insights.',
    instruction:
      'Be analytical and structured. Focus on patterns, cause-and-effect, and logic-driven insights.',
  },
  {
    id: 'close_friend',
    label: 'Close Friend',
    blurb: 'Conversational and casual.',
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

export const PROCESS_MODEL = 'gemini-1.5-flash';
export const CHAT_MODEL = 'gemini-1.5-flash';
