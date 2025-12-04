export interface BrowserOptions {
  headless: boolean;
  defaultViewport: {
    width: number;
    height: number;
  };
  args: string[];
  executablePath?: string;
}

export interface AutomationResult {
  success: boolean;
  message: string;
  error?: string;
  url?: string;
}