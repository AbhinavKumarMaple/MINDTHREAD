import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@mindthread.app';
const DEMO_PASSWORD = 'demo12345';

interface SeedEntry {
  daysAgo: number;
  hour: number;
  dump: string;
  title: string;
  summary: string;
  mood: number;
  emotions: string[];
  themes: string[];
  reflectiveQuestion: string;
  aiAnalysis: string;
  isConcern?: boolean;
  tasks?: { title: string; priority: 'low' | 'normal' | 'high'; done?: boolean }[];
}

const ENTRIES: SeedEntry[] = [
  {
    daysAgo: 0,
    hour: 23,
    dump: "can't sleep again. been thinking about the conversation with arjun. feel like i said something wrong. the presentation is tomorrow and i haven't started.",
    title: 'The Weight of Unfinished Things',
    summary:
      'A late-night spiral about an unresolved conversation and an unprepared presentation. Anxiety is feeding on uncertainty.',
    mood: 4.0,
    emotions: ['anxious', 'reflective'],
    themes: ['work-stress', 'self-doubt'],
    reflectiveQuestion:
      'What would it feel like to walk into that meeting already prepared?',
    aiAnalysis:
      'You tend to ruminate late at night, replaying conversations and projecting worst cases onto tomorrow.',
    isConcern: true,
    tasks: [
      { title: 'Prepare slides for the presentation', priority: 'high' },
      { title: 'Follow up with Arjun about the conversation', priority: 'normal' },
    ],
  },
  {
    daysAgo: 2,
    hour: 8,
    dump: 'woke up early, made coffee, actually felt calm for once. small wins. got through the whole morning without checking slack.',
    title: 'A Surprisingly Good Tuesday',
    summary:
      'A calm, intentional morning with a sense of control and small accomplishments.',
    mood: 7.5,
    emotions: ['content', 'hopeful'],
    themes: ['growth', 'self-care'],
    reflectiveQuestion: 'What made this morning feel different from the others?',
    aiAnalysis:
      'Mornings where you protect your attention seem to set a noticeably better tone for the day.',
    tasks: [
      { title: 'Go for a morning walk', priority: 'low', done: true },
      { title: 'Look into that freelance opportunity', priority: 'normal' },
    ],
  },
  {
    daysAgo: 4,
    hour: 1,
    dump: 'late night scroll turned into overthinking everything. why do i always do this. tomorrow is going to be rough.',
    title: 'Late Night Spiral',
    summary:
      'Doomscrolling escalated into self-criticism and dread about the next day.',
    mood: 3.2,
    emotions: ['melancholic', 'anxious'],
    themes: ['self-doubt', 'sleep'],
    reflectiveQuestion: 'What might a gentler version of you say right now?',
    aiAnalysis:
      'Late-night phone use repeatedly precedes your lowest mood entries.',
    isConcern: true,
  },
  {
    daysAgo: 6,
    hour: 19,
    dump: 'had a good talk with mom. reminded me what matters. feeling grateful even though work is heavy.',
    title: 'Grounded Again',
    summary:
      'A meaningful conversation restored perspective despite ongoing work pressure.',
    mood: 6.8,
    emotions: ['grateful', 'reflective'],
    themes: ['relationships', 'gratitude'],
    reflectiveQuestion: 'What did that conversation remind you to hold onto?',
    aiAnalysis:
      'Connection with people you trust reliably lifts your mood, even on heavy days.',
  },
  {
    daysAgo: 9,
    hour: 22,
    dump: 'reviewed the draft for the third time. still not sure its good enough. second-guessing every decision.',
    title: 'Reviewing the Draft',
    summary:
      'Perfectionism and second-guessing around a piece of work nearing completion.',
    mood: 4.5,
    emotions: ['anxious', 'frustrated'],
    themes: ['self-doubt', 'work-stress'],
    reflectiveQuestion: "What would 'good enough to ship' look like here?",
    aiAnalysis:
      'Self-doubt clusters tightly around deadlines and creative work you care about.',
    tasks: [{ title: 'Send the draft for feedback', priority: 'normal' }],
  },
  {
    daysAgo: 12,
    hour: 9,
    dump: 'morning breakthrough. finally understood why the project felt stuck. excited to rebuild it properly.',
    title: 'Morning Breakthrough',
    summary:
      'A clear-headed realization unblocked a stuck project and renewed motivation.',
    mood: 8.5,
    emotions: ['excited', 'hopeful'],
    themes: ['growth', 'clarity'],
    reflectiveQuestion: 'What helped the insight finally land this morning?',
    aiAnalysis:
      'Your highest-energy, most creative entries tend to happen in the morning.',
    tasks: [{ title: 'Rebuild the project structure', priority: 'high' }],
  },
  {
    daysAgo: 16,
    hour: 18,
    dump: 'reflection on growth this month. ups and downs but i can see progress. trying to be kinder to myself.',
    title: 'Reflection on Growth',
    summary:
      'A balanced month-in-review acknowledging both struggle and genuine progress.',
    mood: 7.0,
    emotions: ['reflective', 'hopeful'],
    themes: ['growth', 'self-care'],
    reflectiveQuestion: 'Where did you grow this month without noticing?',
    aiAnalysis:
      'You show a recurring, healthy capacity to reframe setbacks as growth.',
  },
];

const INSIGHTS = [
  {
    text: 'Your most reflective entries happen late at night — and they are also your lowest-mood ones. The hour may matter more than the topic.',
    category: 'timing',
  },
  {
    text: "Mornings are your superpower: every entry written before 10am scores well above your average mood. Protecting that window pays off.",
    category: 'mood',
  },
  {
    text: 'Self-doubt shows up almost exclusively around deadlines and creative work — not in your life broadly. It is situational, not who you are.',
    category: 'themes',
  },
  {
    text: 'Conversations with people you trust consistently lift your mood, even on your heaviest workdays.',
    category: 'relationships',
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      displayName: 'Journal',
      tone: 'warm',
      onboardedAt: new Date(),
    },
  });

  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.entry.deleteMany({ where: { userId: user.id } });
  await prisma.insight.deleteMany({ where: { userId: user.id } });

  const now = Date.now();
  const DAY = 86_400_000;
  let n = 0;

  // Oldest first so entryNumber increases with time.
  const ordered = [...ENTRIES].sort((a, b) => b.daysAgo - a.daysAgo);
  for (const s of ordered) {
    n += 1;
    const createdAt = new Date(now - s.daysAgo * DAY);
    createdAt.setHours(s.hour, 15, 0, 0);
    const entry = await prisma.entry.create({
      data: {
        userId: user.id,
        entryNumber: n,
        rawDump: s.dump,
        status: 'processed',
        toneUsed: 'warm',
        title: s.title,
        summary: s.summary,
        aiAnalysis: s.aiAnalysis,
        reflectiveQuestion: s.reflectiveQuestion,
        moodScore: s.mood,
        emotions: JSON.stringify(s.emotions),
        themes: JSON.stringify(s.themes),
        isConcern: s.isConcern ?? false,
        concernStatus: s.isConcern ? 'unresolved' : null,
        wordCount: s.dump.split(/\s+/).length,
        processedAt: createdAt,
        createdAt,
      },
    });
    for (const t of s.tasks ?? []) {
      await prisma.task.create({
        data: {
          userId: user.id,
          title: t.title,
          priority: t.priority,
          status: t.done ? 'done' : 'pending',
          completedAt: t.done ? createdAt : null,
          source: 'entry',
          sourceEntryId: entry.id,
          isConcern: s.isConcern ?? false,
          createdAt,
        },
      });
    }
  }

  // A couple of manual tasks too.
  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Update the design system tokens',
      priority: 'normal',
      status: 'done',
      completedAt: new Date(),
      source: 'manual',
    },
  });
  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Plan the week ahead',
      priority: 'normal',
      source: 'manual',
    },
  });

  for (const i of INSIGHTS) {
    await prisma.insight.create({
      data: {
        userId: user.id,
        text: i.text,
        category: i.category,
        basedOn: ENTRIES.length,
      },
    });
  }

  console.log(`Seeded demo user:\n  email: ${DEMO_EMAIL}\n  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
