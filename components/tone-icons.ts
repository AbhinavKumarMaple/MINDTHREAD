import { Zap, Leaf, Microscope, Handshake, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/lib/types';

export const TONE_ICONS: Record<Tone, LucideIcon> = {
  blunt: Zap,
  warm: Leaf,
  analytical: Microscope,
  close_friend: Handshake,
};
