const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis_cache:6379';
const client = createClient({ url: redisUrl });

client.on('error', (err) => {
  console.error('Redis Client Error', err && err.message ? err.message : err);
});

client.connect().catch((e) => {
  console.error('Redis connection failed:', e && e.message ? e.message : e);
});

const safe = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (e) {
    console.error('Redis operation failed:', e && e.message ? e.message : e);
    return fallback;
  }
};

module.exports = {
  get: async (key) => safe(async () => {
    const v = await client.get(key);
    return v ? JSON.parse(v) : null;
  }, null),
  set: async (key, value, ttlSeconds) => safe(async () => {
    const s = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, s);
    } else {
      await client.set(key, s);
    }
    return true;
  }, false),
  del: async (key) => safe(async () => {
    await client.del(key);
    return true;
  }, false),
  client,
};
