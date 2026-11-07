import 'dotenv/config';

const port = Number.parseInt(process.env.PORT ?? '5000', 10);
const mongodbUri = process.env.MONGODB_URI?.trim();
const jwtSecret = process.env.JWT_SECRET?.trim();
const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || '1h';
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (!mongodbUri) {
  throw new Error('MONGODB_URI is required');
}

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

if (!/^\d+(s|m|h|d|w|y)$/.test(jwtExpiresIn)) {
  throw new Error('JWT_EXPIRES_IN must use a duration such as 1h or 7d');
}

if ((adminEmail && !adminPassword) || (!adminEmail && adminPassword)) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be provided together');
}

if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
  throw new Error('ADMIN_EMAIL must be a valid email address');
}

if (adminPassword && adminPassword.length < 8) {
  throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  mongodbUri,
  jwtSecret,
  jwtExpiresIn,
  initialAdmin: adminEmail && adminPassword
    ? { email: adminEmail, password: adminPassword }
    : undefined,
} as const;
