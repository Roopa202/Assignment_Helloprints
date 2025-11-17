// pages/HomePage.js

const BasePage = require("./BasePage.js");

class HomePage extends BasePage {
  constructor(page) {
    super(page);
  }

  // FIXED: Correct goto method
    async openHomePage(baseURL) {
    await this.page.goto(baseURL);

    // Accept cookies if visible
    await this.acceptCookiesIfVisible();
  }
  
  /**
 * Waits for a new tab to open and switches to it.
 * Returns the new page instance.
 */
async switchToNewTab() {
  // Wait for a new page to open
  const newPagePromise = this.page.context().waitForEvent("page");

  const newPage = await newPagePromise;

  // Wait for the new page to load
  await newPage.waitForLoadState("domcontentloaded");

  console.log("Switched to new tab");

  return newPage;
}


  /**
   * Navigate via menu → submenu → final product link
   */
  async navigateToProduct(mainHoverText, subHoverText, finalClickText) {
    try {
      // 1) Hover main menu item
      const mainMenu = this.page.locator(
        `//*[@class="menu-item menu-item--hoverable"]//*[contains(text(),"${mainHoverText}")]`
      );
      await mainMenu.waitFor({ state: "visible", timeout: 8000 });
      await mainMenu.hover();

      // 2) Hover submenu
      const subMenu = this.page.locator(
        `//a[contains(@class,"header__submenu-title") and contains(text(),"${subHoverText}")]`
      );
      await subMenu.waitFor({ state: "visible", timeout: 8000 });
      await subMenu.hover();

      // 3) Click final link
      const finalItem = this.page.locator(
        `//a[contains(@class,"header-mobile__sub-submenu-second-anchor") and contains(text(),"${finalClickText}")]`
      );
      await finalItem.waitFor({ state: "visible", timeout: 8000 });
      await finalItem.click();

    } catch (err) {
      throw new Error(`
NAVIGATION FAILED
-----------------
main menu: ${mainHoverText}
sub menu: ${subHoverText}
final click: ${finalClickText}

Error: ${err.message}
      `);
    }
  }

 async acceptCookiesIfVisible() {
  const cookieButton = this.page.locator(
    "//*[@id='consent-popup']//*[text()='Accept all']"
  );

  // Check if element exists AND is visible
  const isVisible = await cookieButton.isVisible().catch(() => false);
  const count = await cookieButton.count().catch(() => 0);

  if (count > 0 && isVisible) {
    console.log("Cookie popup detected → clicking Accept all");
    await cookieButton.click();
    await this.page.waitForTimeout(500); // small wait after click
  } else {
    console.log(" No cookie popup found");
  }
}

  /**
   * Change language using header selector
   */
  async changeLanguage(targetLanguage) {
  try {
    const languageIcon = this.page.locator(
      '//*[@class="header__language-bar"]//*[@class="header__language-bar-icon"]'
    );

    await languageIcon.waitFor({ state: "visible", timeout: 10000 });

    // Click opens popup
    await languageIcon.click();

    const languageOption = this.page.locator(
      `//*[contains(@class,"header__language")]//*[contains(text(),"${targetLanguage}")]`
    );

    await languageOption.waitFor({ state: "visible", timeout: 10000 });

    // Click triggers new tab
    const newTabPromise = this.page.context().waitForEvent("page");
    await languageOption.click();
    const newTab = await newTabPromise;

    await newTab.waitForLoadState("domcontentloaded");

    console.log(`Language switched → New tab opened for ${targetLanguage}`);

    // Update this.page to the new tab
    this.page = newTab;

    return newTab;

  } catch (err) {
    throw new Error(`
Language Selection Failed!
Tried: "${targetLanguage}"

Error: ${err.message}
`);
  }
}
  
}

module.exports = HomePage;
