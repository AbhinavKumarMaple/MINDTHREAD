import { toneMeta } from '../constants';
import type { Tone, Entry } from '../types';

export function baseSystem(tone: Tone): string {
  const meta = toneMeta(tone);
  return [
    'You are MINDTHREAD, an AI journaling companion — "a second mind" that helps a person reflect on raw, unfiltered thoughts.',
    `Voice: ${meta.label}. ${meta.instruction}`,
    'You are supportive but never clinical or alarmist. You are not a therapist and do not give medical advice.',
  ].join(' ');
}

export function processSystem(tone: Tone): string {
  return [
    baseSystem(tone),
    'Task: read a raw journal "brain dump" and turn it into a structured reflection.',
    'Rules:',
    '- title: a short, evocative title (max 6 words).',
    '- summary: 2-3 sentences capturing what the entry is really about.',
    '- moodScore: 0 (very low) to 10 (very good), reflecting the emotional tone.',
    '- emotions: 1-4 single lowercase words (e.g. anxious, reflective, hopeful).',
    '- themes: 1-4 short lowercase themes (e.g. work-stress, self-doubt, growth).',
    '- reflectiveQuestion: one gentle question that invites deeper reflection.',
    '- isConcern: true only if the entry shows meaningful distress worth gently tracking.',
    '- aiAnalysis: 2-4 sentences naming what you notice, in your assigned voice.',
    '- feeling: 1-2 sentences reflecting how the writer seems to be feeling.',
    '- ideas: 0-4 short ideas or thoughts from the entry worth keeping.',
    '- pattern: if a recurring mental pattern is visible, name it (e.g. "Avoidant Rumination") with whatIsIt (1-2 sentences), evidence (2-3 short bullets quoting/paraphrasing the entry), advice (1-2 sentences), and needsAttention (true if it deserves gentle attention). Use null if no clear pattern.',
    '- tasks: concrete action items the writer implied (0-5). Each has a title and priority (low|normal|high).',
    'Return ONLY the JSON object matching the provided schema.',
  ].join('\n');
}

export function buildProcessPrompt(rawDump: string): string {
  return `Here is the raw journal entry to process:\n\n"""\n${rawDump}\n"""`;
}

export function chatSystem(tone: Tone, entries: Entry[]): string {
  const context = entries
    .slice(0, 40)
    .map((e) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      const mood = e.moodScore != null ? `mood ${e.moodScore}/10` : 'unprocessed';
      const emotions = e.emotions.join(', ') || '—';
      const themes = e.themes.join(', ') || '—';
      const gist = e.summary || e.rawDump.slice(0, 200);
      return `• [${date}] "${e.title ?? 'Untitled'}" (${mood}; emotions: ${emotions}; themes: ${themes}): ${gist}`;
    })
    .join('\n');
  return [
    baseSystem(tone),
    'You are chatting with the writer about their own journal. Ground every answer in the entries below. Cite patterns, dates, moods, and recurring themes when relevant. If the journal lacks the information, say so honestly. Keep replies concise and conversational.',
    '',
    'JOURNAL CONTEXT (most recent first):',
    context || '(no entries yet)',
  ].join('\n');
}

export function insightsSystem(tone: Tone): string {
  return [
    baseSystem(tone),
    'Task: surface 3-6 genuinely useful insights about the writer based on their entries.',
    'Each insight is one or two sentences, specific and grounded in patterns across entries (timing, mood, recurring themes, emotional triggers).',
    'Avoid generic advice. Return ONLY the JSON matching the schema.',
  ].join('\n');
}

export function buildInsightsPrompt(entries: Entry[]): string {
  const lines = entries
    .slice(-50)
    .map((e) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      const hour = new Date(e.createdAt).getHours();
      return `[${date} ${hour}:00] mood=${e.moodScore ?? '?'} emotions=[${e.emotions.join(',')}] themes=[${e.themes.join(',')}] :: ${e.summary ?? e.rawDump.slice(0, 120)}`;
    })
    .join('\n');
  return `Entries:\n${lines}`;
}
