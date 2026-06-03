import Redis from 'ioredis';
import logger from './logger.js';

let redisClient = null;

export function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl);
    
    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }
  return redisClient;
}

export async function getCachedQuery(key, queryFn, ttlSeconds = 300) {
  const client = getRedisClient();
  
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = await queryFn();
    
    // Fire and forget caching
    client.set(key, JSON.stringify(result), 'EX', ttlSeconds).catch(err => {
      logger.error('Error setting Redis cache:', err);
    });
    
    return result;
  } catch (err) {
    logger.warn('Redis cache error, falling back to database query:', err);
    return await queryFn();
  }
}

export function clearCache(keyPattern) {
  const client = getRedisClient();
  
  return new Promise((resolve, reject) => {
    const stream = client.scanStream({
      match: keyPattern,
      count: 100
    });
    
    const keys = [];
    
    stream.on('data', (resultKeys) => {
      for (let i = 0; i < resultKeys.length; i++) {
        keys.push(resultKeys[i]);
      }
    });
    
    stream.on('end', async () => {
      if (keys.length > 0) {
        try {
          await client.del(...keys);
          resolve(keys.length);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(0);
      }
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}
