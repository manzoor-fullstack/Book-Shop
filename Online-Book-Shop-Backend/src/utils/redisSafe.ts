import redis from '../config/redis';

export const getCache = async (key: string) => {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
};

export const setCache = async (key: string, value: any) => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', 60);
  } catch {}
};

export const deleteCache = async (key: string) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
};