// Prisma script to migrate old analysis.imageUrl values to Hugging Face URLs
// Run with: npx tsx prisma/migrate-image-urls.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HUGGINGFACE_BASE = 'https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/';

async function main() {
  const analyses = await prisma.analysis.findMany();

  let updated = 0;
  for (const analysis of analyses) {
    if (
      analysis.imageUrl &&
      !analysis.imageUrl.startsWith('http')
    ) {
      // Always convert to Hugging Face URL if not already a full URL
      const filename = analysis.imageUrl.replace(/^\/uploads\//, '').replace(/^\/+/, '');
      const newUrl = HUGGINGFACE_BASE + filename;
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { imageUrl: newUrl },
      });
      updated++;
      console.log(`Updated analysis ${analysis.id}: ${newUrl}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} records.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
