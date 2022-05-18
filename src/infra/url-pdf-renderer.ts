import * as puppeteer from "puppeteer";

export class UrlPdfRenderer {
  readonly browser: puppeteer.Browser;

  constructor(browser: puppeteer.Browser) {
    this.browser = browser;
  }

  async render(url: string): Promise<Buffer> {
    const page = await this.browser.newPage();

    try {
      const response = await page.goto(url, {
        waitUntil: "networkidle2",
      });

      if (response.status() !== 200) {
        throw new Error(`Failed to load url: ${url}`);
      }

      return await page.pdf({
        format: "A4",
      });
    } finally {
      await page.close();
    }
  }
}
