import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required and cannot be empty'),
  JWT_SECRET: z.string().min(10).default('default_jwt_secret_change_me_in_prod'),
  OPENROUTER_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const errorMsg = '❌ Invalid environment variables configuration:\n' + JSON.stringify(parseResult.error.format(), null, 2);
  console.error(errorMsg);
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    process.exit(1);
  } else {
    throw new Error(errorMsg);
  }
}

export const env = parseResult.data;
