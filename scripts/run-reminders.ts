#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import { runDueReminders } from '../src/features/appointments/actions';
import { migrationClient } from '../src/db';

async function main() {
  console.log('⏳ Running due appointment reminders...');
  const res = await runDueReminders();
  console.log(`✅ Reminders run successfully. Sent: ${res.sentCount}, Failed: ${res.failedCount}`);
  await migrationClient.end();
}

main().catch((err) => {
  console.error('❌ Run reminders failed:', err);
  process.exit(1);
});


