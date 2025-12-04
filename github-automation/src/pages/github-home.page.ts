import { Page, Locator } from 'playwright';

export class GithubHomePage {
  private readonly page: Page;
  
  // Locators
  private readonly userMenu: Locator;
  private readonly userAvatar: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.locator('summary[aria-label*="profile"]');
    this.userAvatar = page.locator('img[alt*="@"]');
    this.searchInput = page.locator('input[placeholder="Search GitHub"]');
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for user avatar or menu
      await this.page.waitForTimeout(2000);
      return await this.userAvatar.count() > 0 || await this.userMenu.count() > 0;
    } catch {
      return false;
    }
  }

  async getUsername(): Promise<string | null> {
    try {
      if (await this.userMenu.count() > 0) {
        await this.userMenu.click();
        const usernameElement = this.page.locator('strong[itemprop="name"]');
        if (await usernameElement.count() > 0) {
          const username = await usernameElement.textContent();
          await this.page.keyboard.press('Escape'); // Close menu
          return username;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }
}