// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Create the PostgreSQL adapter with your DATABASE_URL
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// Singleton for Next.js dev mode
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: pool });

// Assign in dev to avoid multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
