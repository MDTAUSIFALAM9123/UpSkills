import * as PrismaPkg from '@prisma/client';
const PrismaClient: any = (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? PrismaPkg;

import { PrismaPg } from '@prisma/adapter-pg';

// Create the PostgreSQL adapter with your DATABASE_URL
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as { prisma?: any };

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: pool });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };