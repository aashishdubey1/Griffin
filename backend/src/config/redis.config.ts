import Redis from "ioredis";
import serverConfig from "./server.config";
import logger from "./logger.config";

console.log(
  "Connecting to Redis:",
  serverConfig.REDIS_HOST,
  serverConfig.REDIS_PORT
);

const redis = new Redis({
  port: Number(serverConfig.REDIS_PORT!),
  host: serverConfig.REDIS_HOST,
  lazyConnect: true,
  maxRetriesPerRequest: null,
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
