import 'dotenv/config';
import { SystemChecker } from './utils/SystemChecker';
import { FacebookAutomation } from './facebook/FacebookAutomation';
import { logger } from './utils/Logger';

async function main() {
  try {
    logger.info('=== Facebook Automation Tool ===');
    
    // Step 1: Check if running on Windows
    SystemChecker.checkOS();
    
    // Step 2: Check if Chrome is installed
    logger.info('Checking Chrome installation...');
    const isChromeInstalled = await SystemChecker.checkChromeInstalled();
    
    if (!isChromeInstalled) {
      logger.warn('Chrome not found. Please ensure Chrome is installed.');
      logger.info('Download Chrome from: https://www.google.com/chrome/');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise<void>((resolve) => {
        readline.question('Do you want to continue anyway? (y/n): ', (answer: string) => {
          if (answer.toLowerCase() !== 'y') {
            logger.info('Exiting...');
            process.exit(0);
          }
          readline.close();
          resolve();
        });
      });
    }
    
    // Step 3: Run automation
    logger.info('Initializing Facebook automation...');
    const automation = new FacebookAutomation();
    
    // Run with 2 minute timeout
    const result = await automation.runWithTimeout(120000);
    
    // Display results
    console.log('\n' + '='.repeat(50));
    if (result.success) {
      logger.success('Automation completed successfully!');
      console.log(`Status: ${result.message}`);
      console.log(`URL: ${result.url}`);
    } else {
      logger.error('Automation failed!');
      console.log(`Error: ${result.error}`);
    }
    console.log('='.repeat(50) + '\n');
    
    // Keep the process running until user closes browser
    if (result.success) {
      process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await automation['browserLauncher'].close();
        process.exit(0);
      });
      
      // Keep process alive
      await new Promise(() => {});
    }
    
  } catch (error) {
    logger.error('Fatal error occurred', error as Error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

export { FacebookAutomation, SystemChecker };