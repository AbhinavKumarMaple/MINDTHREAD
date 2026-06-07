import type { Prisma } from '@prisma/client';
import { prisma } from '../db';
import type {
  Repositories,
  UserRepository,
  EntryRepository,
  TaskRepository,
  ChatRepository,
  InsightRepository,
  EntryListFilters,
  TaskListFilters,
  UpdateEntryInput,
  CreateTaskInput,
  UpdateTaskInput,
} from './interfaces';
import {
  toEntry,
  toTask,
  toChatSession,
  toChatMessage,
  toInsight,
} from './serialize';

const users: UserRepository = {
  findById: (id) => prisma.user.findUnique({ where: { id } }) as any,
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }) as any,
  create: (input) =>
    prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName ?? 'Journal',
        tone: input.tone ?? 'warm',
      },
    }) as any,
  update: (id, input) =>
    prisma.user.update({ where: { id }, data: input }) as any,
};

function entryOrderBy(
  sort: EntryListFilters['sort'],
): Prisma.EntryOrderByWithRelationInput {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'mood-high':
      return { moodScore: 'desc' };
    case 'mood-low':
      return { moodScore: 'asc' };
    default:
      return { createdAt: 'desc' };
  }
}

const entries: EntryRepository = {
  async list(userId, filters = {}) {
    const where: Prisma.EntryWhereInput = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.concernOnly) where.isConcern = true;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }
    if (filters.emotion)
      where.emotions = { contains: `"${filters.emotion}"` };
    if (filters.theme) where.themes = { contains: `"${filters.theme}"` };
    if (filters.search) {
      where.OR = [
        { rawDump: { contains: filters.search } },
        { title: { contains: filters.search } },
      ];
    }
    const rows = await prisma.entry.findMany({
      where,
      orderBy: entryOrderBy(filters.sort),
    });
    return rows.map(toEntry);
  },
  async listAll(userId) {
    const rows = await prisma.entry.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toEntry);
  },
  async get(userId, id) {
    const row = await prisma.entry.findFirst({ where: { id, userId } });
    return row ? toEntry(row) : null;
  },
  async create(userId, input) {
    const row = await prisma.$transaction(async (tx) => {
      const agg = await tx.entry.aggregate({
        where: { userId },
        _max: { entryNumber: true },
      });
      const next = (agg._max.entryNumber ?? 0) + 1;
      return tx.entry.create({
        data: {
          userId,
          entryNumber: next,
          rawDump: input.rawDump,
          toneUsed: input.toneUsed,
          status: 'draft',
          wordCount: input.rawDump.trim()
            ? input.rawDump.trim().split(/\s+/).length
            : 0,
        },
      });
    });
    return toEntry(row);
  },
  async update(userId, id, input) {
    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing) return null;
    const data: Prisma.EntryUpdateInput = {};
    const apply = <K extends keyof UpdateEntryInput>(k: K) =>
      input[k] !== undefined;
    if (apply('rawDump')) data.rawDump = input.rawDump;
    if (apply('status')) data.status = input.status;
    if (apply('toneUsed')) data.toneUsed = input.toneUsed;
    if (apply('title')) data.title = input.title;
    if (apply('summary')) data.summary = input.summary;
    if (apply('aiAnalysis')) data.aiAnalysis = input.aiAnalysis;
    if (apply('reflectiveQuestion'))
      data.reflectiveQuestion = input.reflectiveQuestion;
    if (apply('moodScore')) data.moodScore = input.moodScore;
    if (apply('emotions')) data.emotions = JSON.stringify(input.emotions);
    if (apply('themes')) data.themes = JSON.stringify(input.themes);
    if (apply('isConcern')) data.isConcern = input.isConcern;
    if (apply('concernStatus')) data.concernStatus = input.concernStatus;
    if (apply('wordCount')) data.wordCount = input.wordCount;
    if (apply('aiError')) data.aiError = input.aiError;
    if (apply('processedAt')) data.processedAt = input.processedAt;
    const row = await prisma.entry.update({ where: { id }, data });
    return toEntry(row);
  },
  async remove(userId, id) {
    await prisma.entry.deleteMany({ where: { id, userId } });
  },
  count: (userId) => prisma.entry.count({ where: { userId } }),
};

function taskWhere(
  userId: string,
  filters: TaskListFilters,
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { userId };
  if (filters.status === 'pending') where.status = 'pending';
  else if (filters.status === 'done') where.status = 'done';
  else if (filters.status === 'concern') where.isConcern = true;
  if (filters.source) where.source = filters.source;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }
  return where;
}

const tasks: TaskRepository = {
  async list(userId, filters = {}) {
    const orderBy: Prisma.TaskOrderByWithRelationInput =
      filters.sort === 'oldest'
        ? { createdAt: 'asc' }
        : filters.sort === 'priority'
          ? { priority: 'desc' }
          : { createdAt: 'desc' };
    const rows = await prisma.task.findMany({
      where: taskWhere(userId, filters),
      orderBy,
      include: { entry: { select: { entryNumber: true } } },
    });
    return rows.map(toTask);
  },
  async get(userId, id) {
    const row = await prisma.task.findFirst({
      where: { id, userId },
      include: { entry: { select: { entryNumber: true } } },
    });
    return row ? toTask(row) : null;
  },
  async create(userId, input) {
    const row = await prisma.task.create({
      data: {
        userId,
        title: input.title,
        priority: input.priority ?? 'normal',
        source: input.source ?? 'manual',
        sourceEntryId: input.sourceEntryId ?? null,
        isConcern: input.isConcern ?? false,
        dueDate: input.dueDate ?? null,
      },
      include: { entry: { select: { entryNumber: true } } },
    });
    return toTask(row);
  },
  async createMany(userId, inputs) {
    const created = await Promise.all(
      inputs.map((input) =>
        prisma.task.create({
          data: {
            userId,
            title: input.title,
            priority: input.priority ?? 'normal',
            source: input.source ?? 'entry',
            sourceEntryId: input.sourceEntryId ?? null,
            isConcern: input.isConcern ?? false,
          },
          include: { entry: { select: { entryNumber: true } } },
        }),
      ),
    );
    return created.map(toTask);
  },
  async update(userId, id, input) {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return null;
    const data: Prisma.TaskUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate;
    if (input.status !== undefined) {
      data.status = input.status;
      data.completedAt = input.status === 'done' ? new Date() : null;
    }
    const row = await prisma.task.update({
      where: { id },
      data,
      include: { entry: { select: { entryNumber: true } } },
    });
    return toTask(row);
  },
  async remove(userId, id) {
    await prisma.task.deleteMany({ where: { id, userId } });
  },
  async counts(userId) {
    const [all, done, pending, concern] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'done' } }),
      prisma.task.count({ where: { userId, status: 'pending' } }),
      prisma.task.count({ where: { userId, isConcern: true } }),
    ]);
    return { all, done, pending, concern };
  },
};

const chat: ChatRepository = {
  async listSessions(userId) {
    const rows = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(toChatSession);
  },
  async createSession(userId, title) {
    const row = await prisma.chatSession.create({
      data: { userId, title: title ?? null },
    });
    return toChatSession(row);
  },
  async getSession(userId, id) {
    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });
    if (!session) return null;
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' },
    });
    return {
      session: toChatSession(session),
      messages: messages.map(toChatMessage),
    };
  },
  async latestSession(userId) {
    const row = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return row ? toChatSession(row) : null;
  },
  async addMessage(userId, sessionId, role, content) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new Error('Chat session not found');
    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({ data: { sessionId, role, content } }),
      prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      }),
    ]);
    return toChatMessage(message);
  },
};

const insights: InsightRepository = {
  async list(userId) {
    const rows = await prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toInsight);
  },
  async replaceAll(userId, items) {
    await prisma.insight.deleteMany({ where: { userId } });
    for (const i of items) {
      await prisma.insight.create({
        data: {
          userId,
          text: i.text,
          category: i.category ?? null,
          basedOn: i.basedOn ?? 0,
        },
      });
    }
    return this.list(userId);
  },
};

export const prismaRepositories: Repositories = {
  users,
  entries,
  tasks,
  chat,
  insights,
};
