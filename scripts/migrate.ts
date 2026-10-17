#!/usr/bin/env tsx
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, migrationClient } from '../src/db';

async function main() {
  console.log('⏳ Running migrations...');

  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('✅ Migrations completed!');

  await migrationClient.end();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
