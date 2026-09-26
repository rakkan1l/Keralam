import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.resolve(__dirname, '../../.env');

// Node >= 20.12 can load .env files natively, so no dotenv dependency is needed.
if (process.env.NODE_ENV !== 'test' && fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const isProd = process.env.NODE_ENV === 'production';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const jwtSecret = process.env.JWT_SECRET || (isProd ? undefined : 'dev-only-insecure-secret');
if (isProd && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: required('MONGODB_URI', isProd ? undefined : 'mongodb://127.0.0.1:27017/kerala_travel'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 600,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  routing: {
    provider: (process.env.ROUTING_PROVIDER || 'estimate').toLowerCase(),
    osrmUrl: process.env.OSRM_URL || 'https://router.project-osrm.org',
  },
  weather: {
    provider: (process.env.WEATHER_PROVIDER || 'none').toLowerCase(),
    openMeteoUrl: process.env.OPEN_METEO_URL || 'https://api.open-meteo.com/v1/forecast',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || '').toLowerCase(),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-opus-5',
  },
};

export const features = {
  get uploads() {
    const c = env.cloudinary;
    return Boolean(c.cloudName && c.apiKey && c.apiSecret);
  },
  get ai() {
    return env.ai.provider === 'anthropic' && Boolean(env.ai.anthropicApiKey);
  },
  get liveRouting() {
    return env.routing.provider === 'osrm';
  },
  get weather() {
    return env.weather.provider === 'open-meteo';
  },
};
