// User roles and specialties
export type UserRole = 'engineer' | 'team_lead' | 'admin';
export type EngineerSpecialty = 'frontend' | 'backend' | 'infrastructure' | 'ml';
export type AppPhase = 'registration' | 'swiping' | 'ranking' | 'matching' | 'complete';

// Database entities
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  specialty: EngineerSpecialty | null;
  bio: string | null;
  created_at: Date;
}

export interface Idea {
  id: string;
  created_by: string;
  title: string;
  description: string;
  needs_frontend: number;
  needs_backend: number;
  needs_infrastructure: number;
  needs_ml: number;
  created_at: Date;
}

export interface Swipe {
  id: string;
  user_id: string;
  idea_id: string;
  interested: boolean;
  created_at: Date;
}

export interface Ranking {
  id: string;
  idea_id: string;
  user_id: string;
  rank: number;
  created_at: Date;
}

export interface Match {
  id: string;
  user_id: string;
  idea_id: string;
  created_at: Date;
}

// API request/response types
export interface CreateUserRequest {
  name: string;
  role: UserRole;
  specialty?: EngineerSpecialty;
  bio?: string;
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  needs_frontend: number;
  needs_backend: number;
  needs_infrastructure: number;
  needs_ml: number;
}

export interface SwipeRequest {
  idea_id: string;
  interested: boolean;
}

export interface RankingRequest {
  idea_id: string;
  rankings: { user_id: string; rank: number }[];
}

// API response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface IdeaWithCreator extends Idea {
  creator: Pick<User, 'id' | 'name'>;
}

export interface InterestedEngineer {
  user: Pick<User, 'id' | 'name' | 'specialty' | 'bio'>;
  rank?: number;
}

export interface MatchResult {
  idea: Idea;
  team_members: Pick<User, 'id' | 'name' | 'specialty'>[];
}

// Session info returned by /api/auth/me
export interface SessionInfo {
  user: User | null;
  phase: AppPhase;
}
