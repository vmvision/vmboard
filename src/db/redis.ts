import { Redis } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};
const url =
  process.env.REDIS_URL || process.env.REDIS_URI || "redis://localhost:6379";
if (!url) {
  if (process.env.IS_BUILDING !== "true") {
    throw new Error("REDIS_URL is not set");
  }
}
const parsedURL = new URL(url);

export const redisConfig = {
  host: parsedURL.hostname || "localhost",
  port: Number(parsedURL.port || 6379),
  database: (parsedURL.pathname || "/0").slice(1) || "0",
  password: parsedURL.password
    ? decodeURIComponent(parsedURL.password)
    : undefined,
  connectTimeout: 10000,
};

const getRedis = (reuse = true): Redis => {
  if (process.env.IS_BUILDING === "true") {
    console.log("While building, redis will return undefined");
    return undefined as unknown as Redis;
  }
  return reuse ? (globalForRedis.redis ?? new Redis(url)) : new Redis(url);
};
const redis = globalForRedis.redis ?? getRedis();

export default redis;

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export const REDIS_PREFIX = {
  CONFIG: "config",
} as const;

// Used for trpc subscribing to channels
export const redisForSub = getRedis(false);
