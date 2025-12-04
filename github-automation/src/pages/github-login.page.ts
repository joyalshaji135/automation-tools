import { Page, Locator } from 'playwright';

export class GithubLoginPage {
  private readonly page: Page;
  
  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="login"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.locator('input[name="commit"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('https://github.com/login');
  }

  async login(email: string, password: string): Promise<void> {
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
    
    // Fill in credentials
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Click sign in
    await this.signInButton.click();
    
    // Wait for navigation
    await this.page.waitForURL('**/github.com**', { timeout: 10000 });
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      // Check if we're redirected to GitHub homepage or dashboard
      await this.page.waitForURL('**://github.com/**', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator('.flash-error, .js-flash-alert, [aria-label*="error"]');
    if (await errorElement.count() > 0) {
      return await errorElement.textContent();
    }
    return null;
  }
}