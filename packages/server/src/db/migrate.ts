import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('Running database migration...');

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

  try {
    await pool.query(schema);
    console.log('Migration completed successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Schema already exists, skipping...');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
