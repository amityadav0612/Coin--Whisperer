import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenvConfig();

// Define the environment variable schema
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database Configuration (MongoDB)
  MONGODB_URI: z.string().default('mongodb://localhost:27017/coinwhisperer'),

  // Session Configuration
  SESSION_SECRET: z.string().min(32).default('super_secret_session_key_for_development_only_do_not_use_in_production'),
  SESSION_MAX_AGE: z.string().default('86400000'), // 24 hours in milliseconds

  // JWT Configuration
  JWT_SECRET: z.string().min(32).default('super_secret_jwt_key_for_development_only_do_not_use_in_production'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // WebSocket Configuration
  WS_PORT: z.string().default('3001'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export validated environment variables
export const appConfig = {
  server: {
    port: parseInt(env.PORT, 10),
    nodeEnv: env.NODE_ENV,
  },
  database: {
    mongodb: {
      uri: env.MONGODB_URI,
    },
  },
  session: {
    secret: env.SESSION_SECRET,
    maxAge: parseInt(env.SESSION_MAX_AGE, 10),
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  websocket: {
    port: parseInt(env.WS_PORT, 10),
  },
} as const;

// Type for the config object
export type AppConfig = typeof appConfig; 