import { execSync } from 'child_process';
import { logger } from './Logger';

export class SystemChecker {
  static isWindows(): boolean {
    return process.platform === 'win32';
  }

  static checkOS(): void {
    if (!this.isWindows()) {
      logger.error('This automation tool requires Windows OS');
      process.exit(1);
    }
    logger.info(`Operating System: Windows`);
  }

  static async getChromePath(): Promise<string | null> {
    try {
      // Common Chrome installation paths on Windows
      const possiblePaths = [
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
        process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
      ];

      for (const path of possiblePaths) {
        if (path) {
          try {
            // Check if path exists by trying to access it
            const fs = require('fs');
            if (fs.existsSync(path)) {
              logger.info(`Chrome found at: ${path}`);
              return path;
            }
          } catch {
            continue;
          }
        }
      }

      // Try registry lookup as fallback
      try {
        const regPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe';
        const output = execSync(`reg query "${regPath}" /ve`).toString();
        const match = output.match(/REG_SZ\s+(.+)/);
        if (match) {
          logger.info(`Chrome found via registry: ${match[1]}`);
          return match[1].trim();
        }
      } catch {
        // Registry lookup failed
      }

      logger.warn('Chrome not found in common locations');
      return null;
    } catch (error) {
      logger.error('Error finding Chrome path', error as Error);
      return null;
    }
  }

  static checkChromeInstalled(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const path = await this.getChromePath();
      resolve(!!path);
    });
  }
}