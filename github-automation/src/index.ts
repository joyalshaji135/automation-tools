import { chromium, Browser, Page } from 'playwright';
import { config } from './config/config';
import { GithubLoginPage } from './pages/github-login.page';
import { GithubHomePage } from './pages/github-home.page';

class GithubAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private loginPage: GithubLoginPage | null = null;
  private homePage: GithubHomePage | null = null;

  async initialize(): Promise<void> {
    console.log('🚀 Starting GitHub Automation...');
    
    // Launch browser
    this.browser = await chromium.launch({
      headless: config.browser.headless,
      slowMo: config.browser.slowMo
    });
    
    // Create new page
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Initialize page objects
    this.loginPage = new GithubLoginPage(this.page);
    this.homePage = new GithubHomePage(this.page);
    
    console.log('✅ Browser initialized');
  }

  async automateLogin(): Promise<boolean> {
    if (!this.loginPage || !this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      console.log('🔗 Navigating to GitHub login...');
      await this.loginPage.navigate();
      
      console.log('🔑 Logging in...');
      await this.loginPage.login(config.github.email, config.github.password);
      
      // Wait for login to complete
      await this.page.waitForTimeout(3000);
      
      // Verify login success
      const isSuccess = await this.loginPage.isLoginSuccessful();
      
      if (isSuccess) {
        console.log('✅ Login successful!');
        
        // Check if we're on home page
        const isLoggedIn = await this.homePage!.isLoggedIn();
        if (isLoggedIn) {
          const username = await this.homePage!.getUsername();
          if (username) {
            console.log(`👋 Welcome, ${username.trim()}!`);
          }
          
          // Optional: Perform a search
          console.log('🔍 Searching for "playwright"...');
          await this.homePage!.search('playwright');
          await this.page.waitForTimeout(2000);
        }
        
        return true;
      } else {
        const error = await this.loginPage.getErrorMessage();
        console.error('❌ Login failed:', error || 'Unknown error');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error during automation:', error);
      await this.captureScreenshot('error');
      return false;
    }
  }

  async captureScreenshot(name: string): Promise<void> {
    if (this.page) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await this.page.screenshot({ 
        path: `screenshots/${name}-${timestamp}.png`,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: screenshots/${name}-${timestamp}.png`);
    }
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.waitForTimeout(2000); // Wait before closing
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('👋 Browser closed');
  }
}

// Main execution
async function main() {
  const automation = new GithubAutomation();
  
  try {
    await automation.initialize();
    const success = await automation.automateLogin();
    
    if (success) {
      console.log('🎉 Automation completed successfully!');
    } else {
      console.log('⚠️ Automation completed with issues');
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await automation.close();
  }
}

// Run the automation
if (require.main === module) {
  main();
}

export { GithubAutomation };