import { PetStats } from './pet-stats.entity';

export function applyDecay(stats: PetStats): void {
  const now = new Date().getTime();
  const last = new Date(stats.lastUpdated).getTime();
  const elapsedHours = Math.max(0, (now - last) / 1000 / 3600);

  stats.hunger = clamp(stats.hunger - elapsedHours * 2, 0, 100);
  stats.mood = clamp(stats.mood - elapsedHours * 1, 0, 100);
  stats.energy = clamp(stats.energy + elapsedHours * 1, 0, 100);
  stats.cleanliness = clamp(stats.cleanliness - elapsedHours * 0.5, 0, 100);

  if (stats.hunger < 20 || stats.cleanliness < 20) {
    stats.health = clamp(stats.health - elapsedHours * 1, 0, 100);
  } else if (stats.hunger > 50 && stats.cleanliness > 50 && stats.mood > 50) {
    stats.health = clamp(stats.health + elapsedHours * 0.5, 0, 100);
  }

  stats.lastUpdated = new Date();
}

export function computeStatus(stats: PetStats): string {
  if (stats.health < 30) return 'sick';
  if (stats.hunger < 20) return 'hungry';
  if (stats.energy < 20) return 'tired';
  if (stats.mood < 20) return 'sad';
  if (stats.cleanliness < 20) return 'dirty';
  if (stats.mood > 80 && stats.hunger > 60 && stats.energy > 60 && stats.cleanliness > 60) return 'happy';
  return 'normal';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

export function expForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.5, level - 1));
}
