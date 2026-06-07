import { PrismaClient } from '@prisma/client';

// Restores the demo account to a clean state after manual/QA testing:
// removes any non-demo (test) accounts, clears the API key, resets tone +
// display name, and removes chat sessions. Run after db:seed.
const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@mindthread.app';

async function main() {
  // Remove any test accounts created during QA.
  const deleted = await prisma.user.deleteMany({
    where: { email: { not: DEMO_EMAIL } },
  });

  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    console.log('No demo user found — run db:seed first.');
    return;
  }
  await prisma.chatSession.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: {
      geminiApiKeyEnc: null,
      tone: 'warm',
      displayName: 'Journal',
      model: null,
    },
  });
  console.log(
    `Demo reset: removed ${deleted.count} test account(s); key cleared, tone=warm, name=Journal, chat cleared.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
