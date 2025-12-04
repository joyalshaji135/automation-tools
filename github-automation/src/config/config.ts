import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  github: {
    email: process.env.GITHUB_EMAIL || '',
    password: process.env.GITHUB_PASSWORD || '',
    loginUrl: process.env.GITHUB_URL || 'https://github.com/login',
    homeUrl: 'https://github.com'
  },
  browser: {
    headless: false, // Set to true to run in background
    slowMo: 100, // Slow down by 100ms for visibility
    timeout: 30000
  }
};

if (!config.github.email || !config.github.password) {
  throw new Error('Please set GITHUB_EMAIL and GITHUB_PASSWORD in .env file');
}