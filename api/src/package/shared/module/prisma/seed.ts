import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

import { PrismaClient } from './generated/prisma/client.js';

// Creates the internal Organization and its first Administrator. Safe to run twice, and on a
// database the tenancy migration already backfilled (it reuses the internal Organization).
const INTERNAL_ORGANIZATION_NAME = 'Umbrielship';
const INTERNAL_ORGANIZATION_EMAIL = 'internal@umbrielship.local';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const internal =
      (await prisma.organization.findFirst({ where: { isInternal: true } })) ??
      (await prisma.organization.create({
        data: {
          name: INTERNAL_ORGANIZATION_NAME,
          email: INTERNAL_ORGANIZATION_EMAIL,
          isInternal: true,
        },
      }));

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.membership.upsert({
        where: {
          userId_organizationId: {
            userId: existing.id,
            organizationId: internal.id,
          },
        },
        create: {
          userId: existing.id,
          organizationId: internal.id,
          role: 'administrator',
        },
        update: {},
      });

      console.log(`User ${email} already exists; internal membership ensured`);
      return;
    }

    await prisma.user.create({
      data: {
        name: 'Administrator',
        email,
        password: await hash(password, 10),
        activeOrganizationId: internal.id,
        memberships: {
          create: { organizationId: internal.id, role: 'administrator' },
        },
      },
    });

    console.log(`Seeded ${internal.name} and administrator ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
