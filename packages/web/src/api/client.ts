import type {
  User,
  Idea,
  IdeaWithCreator,
  CreateUserRequest,
  CreateIdeaRequest,
  SessionInfo,
  InterestedEngineer,
  MatchResult,
  AppPhase,
} from '@hackr/shared';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// Auth
export async function requestMagicLink(email: string): Promise<{ message: string; link?: string }> {
  return request('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string): Promise<{ user?: User; email?: string; needsProfile: boolean }> {
  return request(`/auth/verify/${token}`);
}

export async function getSession(): Promise<SessionInfo> {
  return request('/auth/me');
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}

// Users
export async function createUser(data: CreateUserRequest & { email: string }): Promise<{ user: User }> {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(data: Partial<Pick<User, 'name' | 'specialty' | 'bio'>>): Promise<{ user: User }> {
  return request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Ideas
export async function getIdeas(): Promise<{ ideas: IdeaWithCreator[] }> {
  return request('/ideas');
}

export async function getMyIdeas(): Promise<{ ideas: Idea[] }> {
  return request('/ideas/mine');
}

export async function getUnswipedIdeas(): Promise<{ ideas: IdeaWithCreator[] }> {
  return request('/ideas/unswiped');
}

export async function getIdea(id: string): Promise<{ idea: IdeaWithCreator }> {
  return request(`/ideas/${id}`);
}

export async function getInterestedEngineers(ideaId: string): Promise<{ engineers: InterestedEngineer[] }> {
  return request(`/ideas/${ideaId}/interested`);
}

export async function createIdea(data: CreateIdeaRequest): Promise<{ idea: Idea }> {
  return request('/ideas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Swipes
export async function createSwipe(ideaId: string, interested: boolean): Promise<void> {
  await request('/swipes', {
    method: 'POST',
    body: JSON.stringify({ idea_id: ideaId, interested }),
  });
}

export async function getSwipeStats(): Promise<{ total: number; swiped: number }> {
  return request('/swipes/stats');
}

// Rankings
export async function saveRankings(ideaId: string, rankings: { user_id: string; rank: number }[]): Promise<void> {
  await request('/rankings', {
    method: 'POST',
    body: JSON.stringify({ idea_id: ideaId, rankings }),
  });
}

// Admin
export async function getPhase(): Promise<{ phase: AppPhase }> {
  return request('/admin/phase');
}

export async function advancePhase(): Promise<{ phase: AppPhase }> {
  return request('/admin/phase/advance', { method: 'POST' });
}

export async function runMatching(): Promise<{ count: number }> {
  return request('/admin/match', { method: 'POST' });
}

export async function getResults(): Promise<{ results: MatchResult[] }> {
  return request('/admin/results');
}

export interface IdeaWithSwipeCount extends IdeaWithCreator {
  swipe_count: number;
}

export async function getRankedIdeas(): Promise<{ ideas: IdeaWithSwipeCount[] }> {
  return request('/admin/ideas/ranked');
}
