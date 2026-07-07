import Redis from 'ioredis';

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', () => {
    console.log('❌ Redis not available, running without cache');
  });

} catch {
  console.log('❌ Redis disabled');
}

export default redis;