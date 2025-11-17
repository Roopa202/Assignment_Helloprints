// pages/BasePage.js

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(url) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async click(selector) {
    await this.page.waitForSelector(selector, { state: "visible" });
    await this.page.click(selector);
  }

  async type(selector, text) {
    await this.page.waitForSelector(selector, { state: "visible" });
    await this.page.fill(selector, text);
  }

  async clear(selector) {
    await this.page.waitForSelector(selector);
    await this.page.fill(selector, "");
  }

  async getText(selector) {
    await this.page.waitForSelector(selector);
    return await this.page.textContent(selector);
  }

  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async wait(seconds) {
    await this.page.waitForTimeout(seconds * 1000);
  }

  async waitForElement(selector) {
    await this.page.waitForSelector(selector, { state: "visible" });
  }

  async waitForClickable(selector) {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible" });
    await locator.waitFor({ state: "attached" });
    await locator.waitFor({ state: "enabled" });
  }

  async selectDropdown(selector, value) {
    await this.page.waitForSelector(selector);
    await this.page.selectOption(selector, value);
  }

  async getCount(selector) {
    return await this.page.locator(selector).count();
  }

  async getAttribute(selector, attrName) {
    await this.page.waitForSelector(selector);
    return await this.page.getAttribute(selector, attrName);
  }

  async scrollTo(selector) {
    await this.page.waitForSelector(selector);
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async assertText(selector, expected) {
    await this.page.waitForSelector(selector);
    const text = await this.getText(selector);
    if (!text.includes(expected)) {
      throw new Error(`Assertion Failed: Expected "${expected}" but got "${text}"`);
    }
  }

  async assertVisible(selector) {
    const visible = await this.page.isVisible(selector);
    if (!visible) throw new Error(`Element not visible: ${selector}`);
  }
}

module.exports = BasePage;
