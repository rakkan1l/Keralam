import { inject } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-tests-1234567890';
process.env.MONGODB_URI = inject('mongoUri');
process.env.AI_PROVIDER = '';
process.env.ROUTING_PROVIDER = 'estimate';
process.env.WEATHER_PROVIDER = 'none';
