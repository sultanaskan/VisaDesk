import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeThisAdminPassword123!";
  const name = process.env.ADMIN_NAME || "System Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role: "ADMIN" }
  });

  // Demo catalog data only. Replace/extend these catalogs for the real business.
  const bangladesh = await prisma.country.upsert({
    where: { code: "BD" }, update: {}, create: { name: "Bangladesh", code: "BD" }
  });
  const india = await prisma.country.upsert({
    where: { code: "IN" }, update: {}, create: { name: "India", code: "IN" }
  });
  const tourist = await prisma.visaCategory.upsert({
    where: { name: "Tourist" }, update: {}, create: { name: "Tourist" }
  });
  const dhaka = await prisma.visaCenter.upsert({
    where: { countryId_name: { countryId: bangladesh.id, name: "Dhaka" } },
    update: {}, create: { countryId: bangladesh.id, name: "Dhaka" }
  });

  for (const [level, price] of [["LOW", "500.00"], ["MID", "1000.00"], ["HIGH", "2000.00"]]) {
    await prisma.priorityPrice.upsert({
      where: {
        fromCountryId_toCountryId_categoryId_centerId_level: {
          fromCountryId: bangladesh.id,
          toCountryId: india.id,
          categoryId: tourist.id,
          centerId: dhaka.id,
          level
        }
      },
      update: {},
      create: {
        fromCountryId: bangladesh.id,
        toCountryId: india.id,
        categoryId: tourist.id,
        centerId: dhaka.id,
        level,
        price
      }
    });
  }

  console.log(`Admin seeded: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
