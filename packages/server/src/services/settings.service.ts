import { query, queryOne } from '../db/index.js';
import type { AppPhase } from '@hackr/shared';

interface AppSetting {
  key: string;
  value: string;
}

export async function getPhase(): Promise<AppPhase> {
  const setting = await queryOne<AppSetting>(
    `SELECT value FROM app_settings WHERE key = 'phase'`
  );
  return (setting?.value || 'registration') as AppPhase;
}

export async function setPhase(phase: AppPhase): Promise<void> {
  await query(
    `UPDATE app_settings SET value = $1 WHERE key = 'phase'`,
    [phase]
  );
}

const PHASE_ORDER: AppPhase[] = ['registration', 'swiping', 'ranking', 'matching', 'complete'];

export async function advancePhase(): Promise<AppPhase> {
  const currentPhase = await getPhase();
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  if (currentIndex < PHASE_ORDER.length - 1) {
    const nextPhase = PHASE_ORDER[currentIndex + 1];
    await setPhase(nextPhase);
    return nextPhase;
  }

  return currentPhase;
}
