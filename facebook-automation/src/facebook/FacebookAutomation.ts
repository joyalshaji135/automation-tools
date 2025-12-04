import { BrowserLauncher } from '../browser/BrowserLauncher';
import { AutomationResult } from '../browser/BrowserTypes';
import { logger } from '../utils/Logger';

export class FacebookAutomation {
  private browserLauncher: BrowserLauncher;
  private readonly FACEBOOK_URL = 'https://www.facebook.com/';

  constructor() {
    this.browserLauncher = new BrowserLauncher({
      headless: false,
    //   Full screen
      defaultViewport: { width: 1920, height: 1080 },
    });
  }

  async automate(): Promise<AutomationResult> {
    try {
      logger.info('Starting Facebook automation...');

      // Launch browser
      await this.browserLauncher.launch();
      
      // Create new page
      await this.browserLauncher.newPage();
      
      // Navigate to Facebook
      await this.browserLauncher.navigateTo(this.FACEBOOK_URL);
      
      // Wait for page to load completely
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Take screenshot for verification
      await this.browserLauncher.takeScreenshot('facebook-loaded.png');
      
      // Get current URL to verify
      const currentUrl = await this.browserLauncher.getCurrentUrl();
      
      const result: AutomationResult = {
        success: true,
        message: 'Successfully opened Facebook in Chrome browser',
        url: currentUrl
      };

      logger.success('Facebook automation completed successfully');
      logger.info(`Current URL: ${currentUrl}`);

      // Keep browser open for user interaction
      logger.info('Browser will remain open. Press Ctrl+C to exit.');

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      logger.error('Facebook automation failed');
      
      const result: AutomationResult = {
        success: false,
        message: 'Failed to open Facebook',
        error: errorMessage
      };

      // Close browser if there's an error
      await this.browserLauncher.close();
      
      return result;
    }
  }

  async runWithTimeout(timeoutMs: number = 60000): Promise<AutomationResult> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(async () => {
        logger.error('Automation timeout exceeded');
        await this.browserLauncher.close();
        resolve({
          success: false,
          message: 'Operation timed out',
          error: 'Timeout exceeded'
        });
      }, timeoutMs);

      try {
        const result = await this.automate();
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }
}