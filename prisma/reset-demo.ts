import { PrismaClient } from '@prisma/client';

// Restores the demo account to a clean state after manual/QA testing:
// clears the API key, resets tone, and removes chat sessions. Run after db:seed.
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@mindthread.app' },
  });
  if (!user) {
    console.log('No demo user found — run db:seed first.');
    return;
  }
  await prisma.chatSession.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { geminiApiKeyEnc: null, tone: 'warm' },
  });
  console.log('Demo reset: API key cleared, tone=warm, chat sessions cleared.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
