-- hackr database schema

-- Custom types
CREATE TYPE user_role AS ENUM ('engineer', 'team_lead', 'admin');
CREATE TYPE engineer_specialty AS ENUM ('frontend', 'backend', 'infrastructure', 'ml');
CREATE TYPE app_phase AS ENUM ('registration', 'swiping', 'ranking', 'matching', 'complete');

-- App settings (single hackathon, tracks phase)
CREATE TABLE app_settings (
  key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO app_settings (key, value) VALUES ('phase', 'registration');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  specialty engineer_specialty,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Magic links for passwordless auth
CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session tokens
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathon ideas/projects
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  needs_frontend INT DEFAULT 0,
  needs_backend INT DEFAULT 0,
  needs_infrastructure INT DEFAULT 0,
  needs_ml INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Engineer swipes on ideas
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  interested BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- Team lead rankings of interested engineers
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Final matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_swipes_idea ON swipes(idea_id);
CREATE INDEX idx_rankings_idea ON rankings(idea_id);
CREATE INDEX idx_matches_idea ON matches(idea_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_magic_links_token ON magic_links(token);
