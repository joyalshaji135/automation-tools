import { test, expect } from '@playwright/test';
import { config } from '../config/config';

test('GitHub login automation', async ({ page }) => {
  // Navigate to GitHub login
  await page.goto(config.github.loginUrl);
  
  // Fill credentials
  await page.fill('input[name="login"]', config.github.email);
  await page.fill('input[name="password"]', config.github.password);
  
  // Click sign in
  await page.click('input[name="commit"]');
  
  // Wait for navigation
  await page.waitForURL('**://github.com/**');
  
  // Verify login success
  const isLoggedIn = await page.locator('img[alt*="@"]').count() > 0;
  expect(isLoggedIn).toBeTruthy();
});