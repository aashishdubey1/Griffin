import { configDotenv } from "dotenv";

configDotenv();

export default {
  PORT: process.env.PORT,
  BUN_ENV: process.env.BUN_ENV,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
};
