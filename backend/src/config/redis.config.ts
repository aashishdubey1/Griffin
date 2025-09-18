import Redis from "ioredis";
import serverConfig from "./server.config";
import logger from "./logger.config";

const redis = new Redis({
  port: Number(serverConfig.REDIS_PORT!), // 19538
  host: serverConfig.REDIS_HOST, // redis-19538.c305.ap-south-1-1.ec2.redns.redis-cloud.com
  username: "default",
  password: serverConfig.REDIS_PASSWORD!, // your Redis Cloud password
  lazyConnect: true,
  maxRetriesPerRequest: null,
  tls: {}, // 👈 Required for Redis Cloud (it enforces TLS/SSL)
});

redis.on("ready", () => {
  logger.info("Redis is ready to use");
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error("Error while connecting redis", error);
});

export default redis;
