import { pool, query } from './index.js';

async function seed() {
  console.log('Seeding database...');

  // Create test users
  const [teamLead1] = await query<{ id: string }>(
    `INSERT INTO users (email, name, role, specialty) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['lead1@test.com', 'Alice (Team Lead)', 'team_lead', 'backend']
  );

  const [teamLead2] = await query<{ id: string }>(
    `INSERT INTO users (email, name, role, specialty) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['lead2@test.com', 'Bob (Team Lead)', 'team_lead', 'frontend']
  );

  // Create engineers
  await query(
    `INSERT INTO users (email, name, role, specialty, bio) VALUES
      ('fe1@test.com', 'Charlie', 'engineer', 'frontend', 'React expert'),
      ('fe2@test.com', 'Diana', 'engineer', 'frontend', 'Vue.js lover'),
      ('be1@test.com', 'Eve', 'engineer', 'backend', 'Node.js guru'),
      ('be2@test.com', 'Frank', 'engineer', 'backend', 'Python enthusiast'),
      ('ml1@test.com', 'Grace', 'engineer', 'ml', 'TensorFlow wizard'),
      ('infra1@test.com', 'Hank', 'engineer', 'infrastructure', 'Kubernetes ninja')`
  );

  // Create admin
  await query(
    `INSERT INTO users (email, name, role) VALUES ($1, $2, $3)`,
    ['admin@test.com', 'Admin', 'admin']
  );

  // Create ideas
  await query(
    `INSERT INTO ideas (created_by, title, description, needs_frontend, needs_backend, needs_ml, needs_infrastructure) VALUES
      ($1, 'AI Code Reviewer', 'Build an AI-powered code review tool that suggests improvements and catches bugs before they hit production.', 2, 1, 1, 0),
      ($1, 'Real-time Collaboration Canvas', 'A Figma-like infinite canvas for brainstorming with real-time multiplayer support.', 2, 2, 0, 1)`,
    [teamLead1.id]
  );

  await query(
    `INSERT INTO ideas (created_by, title, description, needs_frontend, needs_backend, needs_ml, needs_infrastructure) VALUES
      ($1, 'Smart Meeting Scheduler', 'An AI assistant that finds the perfect meeting time by analyzing calendars and preferences.', 1, 2, 1, 0),
      ($1, 'Developer Productivity Dashboard', 'Track your coding habits, PR velocity, and get insights to improve your workflow.', 2, 1, 0, 1)`,
    [teamLead2.id]
  );

  console.log('Seeded:');
  console.log('- 2 team leads (lead1@test.com, lead2@test.com)');
  console.log('- 6 engineers (fe1@, fe2@, be1@, be2@, ml1@, infra1@ @test.com)');
  console.log('- 1 admin (admin@test.com)');
  console.log('- 4 ideas');
  console.log('\nTo login as any user, request a magic link with their email.');

  await pool.end();
}

seed().catch(console.error);
