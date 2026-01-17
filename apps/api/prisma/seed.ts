import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create virtual models
  const virtualModels = [
    {
      name: "Sienna",
      gender: "FEMALE" as const,
      bodyType: "Athletic",
      ethnicity: "Mediterranean",
      styleTags: ["Streetwear", "Urban", "Casual"],
      imageUrl: "https://example.com/models/sienna.jpg"
    },
    {
      name: "Alex",
      gender: "NON_BINARY" as const,
      bodyType: "Slim",
      ethnicity: "East Asian",
      styleTags: ["Minimalist", "Luxury", "Modern"],
      imageUrl: "https://example.com/models/alex.jpg"
    },
    {
      name: "Marcus",
      gender: "MALE" as const,
      bodyType: "Muscular",
      ethnicity: "African American",
      styleTags: ["Athletic", "Streetwear", "Urban"],
      imageUrl: "https://example.com/models/marcus.jpg"
    },
    {
      name: "Ghost Mannequin",
      gender: "NON_BINARY" as const,
      bodyType: "Standard",
      ethnicity: "N/A",
      styleTags: ["Invisible", "Mannequin", "Professional"],
      imageUrl: null
    }
  ];

  for (const model of virtualModels) {
    const modelId = model.name.toLowerCase().replace(/\s+/g, '_') + '_01';
    
    await prisma.virtualModel.upsert({
      where: { id: modelId },
      update: model,
      create: {
        ...model,
        id: modelId
      }
    });
  }

  console.log('🌱 Database seeded with virtual models');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
