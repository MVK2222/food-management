const redis = require('../config/redis');

exports.cacheGet = async (key) => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Redis Get Error:', err);
    return null;
  }
};

exports.cacheSet = async (key, data, ttl = 300) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (err) {
    console.error('Redis Set Error:', err);
  }
};

exports.cacheDelete = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    console.error('Redis Delete Error:', err);
  }
};
