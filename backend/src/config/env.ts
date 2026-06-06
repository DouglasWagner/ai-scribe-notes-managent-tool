import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().default("postgres://scribe:scribe@localhost:5432/scribe_notes"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default("gpt-4o-mini-transcribe"),
  OPENAI_SUMMARY_MODEL: z.string().default("gpt-4o-mini"),
  USE_AI_FALLBACKS: z.coerce.boolean().default(true),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SESSION_TOKEN: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  AWS_S3_PUBLIC_BASE_URL: z.string().optional(),
  AWS_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(25)
});

export const env = envSchema.parse(process.env);
