if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

// For migrations
export const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

// For queries
const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });

