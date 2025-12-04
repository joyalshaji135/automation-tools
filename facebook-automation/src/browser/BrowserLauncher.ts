import puppeteer, { Browser, Page } from 'puppeteer-core';
import { BrowserOptions } from './BrowserTypes';
import { logger } from '../utils/Logger';
import { SystemChecker } from '../utils/SystemChecker';

export class BrowserLauncher {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private options: BrowserOptions;

  constructor(options: Partial<BrowserOptions> = {}) {
    this.options = {
      headless: false, // Show browser by default
      defaultViewport: { width: 1280, height: 800 },
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-infobars'
      ],
      ...options
    };
  }

  async launch(): Promise<Browser> {
    try {
      logger.info('Launching Chrome browser...');
      
      // Get Chrome path
      const chromePath = await SystemChecker.getChromePath();
      if (!chromePath) {
        throw new Error('Chrome browser not found. Please install Chrome.');
      }

      this.options.executablePath = chromePath;

      this.browser = await puppeteer.launch(this.options);
      logger.success('Chrome browser launched successfully');
      
      return this.browser;
    } catch (error) {
      logger.error('Failed to launch browser', error as Error);
      throw error;
    }
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    try {
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set viewport
      await this.page.setViewport(this.options.defaultViewport);
      
      logger.info('New page created');
      return this.page;
    } catch (error) {
      logger.error('Failed to create new page', error as Error);
      throw error;
    }
  }

  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not created. Call newPage() first.');
    }

    try {
      logger.info(`Navigating to: ${url}`);
      await this.page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      logger.success(`Successfully navigated to ${url}`);
    } catch (error) {
      logger.error(`Failed to navigate to ${url}`, error as Error);
      throw error;
    }
  }

  async takeScreenshot(filename: string = 'screenshot.png'): Promise<void> {
    if (!this.page) {
      throw new Error('Page not created');
    }

    try {
      await this.page.screenshot({ path: filename, fullPage: true });
      logger.info(`Screenshot saved as: ${filename}`);
    } catch (error) {
      logger.error('Failed to take screenshot', error as Error);
    }
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.page) {
      throw new Error('Page not created');
    }
    return await this.page.url();
  }

  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('Browser closed');
      }
    } catch (error) {
      logger.error('Error closing browser', error as Error);
    }
  }

  async isBrowserOpen(): Promise<boolean> {
    try {
      return this.browser !== null && (await this.browser.pages()).length > 0;
    } catch {
      return false;
    }
  }

  getBrowser(): Browser | null {
    return this.browser;
  }

  getPage(): Page | null {
    return this.page;
  }
}