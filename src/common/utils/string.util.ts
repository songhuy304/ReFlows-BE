import { randomBytes } from 'node:crypto';

export function generateCode(length = 3): string {
  return randomBytes(length).toString('hex');
}

export function getRandomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}
