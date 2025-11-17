// pages/ProductPage.js

const BasePage = require("./BasePage.js");

class ProductPage extends BasePage {
  constructor(page) {
    super(page);

    // product title locator pattern
    this.productTitleXpath = (name) =>
      `//*[@class="hit__title" and text()="${name}"]`;
  }

  /**
   * Select product by exact title match on product listing page.
   */
  async selectProduct(productName) {
    try {
      const locator = this.page.locator(this.productTitleXpath(productName));

      await locator.waitFor({ state: "visible", timeout: 8000 });
      await locator.scrollIntoViewIfNeeded();
      await locator.click();

    } catch (err) {
      throw new Error(`
PRODUCT NOT AVAILABLE

Attempted: "${productName}"

XPath:
${this.productTitleXpath(productName)}

Error:
${err.message}
`);
    }
  }


  /**
   * Search for product using suggestion list.
   */
  async selectProductUsingSearch(productName) {
    try {
      const searchInput = this.page.locator('//input[@placeholder="Find a product..."]');

      await searchInput.waitFor({ state: "visible", timeout: 8000 });
      await searchInput.click();
      await searchInput.fill(productName);
      await this.page.keyboard.press("Enter");

      const suggestionLocator = this.page.locator(
        `//a[@class="aa-product-suggestion__title" and contains(text(),"${productName}")]`
      );

      await suggestionLocator.waitFor({ state: "visible", timeout: 8000 });
      await suggestionLocator.click();

    } catch (err) {
      throw new Error(`
PRODUCT NOT FOUND IN SEARCH
Searched: "${productName}"

Error:
${err.message}
`);
    }
  }


  /**
   * Validates H1 matches product name.
   */
  async validateProductPage(productName) {
    try {
      const h1 = this.page.locator("//h1");

      await h1.waitFor({ state: "visible", timeout: 8000 });

      const actual = (await h1.textContent()).trim();

      if (!actual.toLowerCase().includes(productName.toLowerCase())) {
        throw new Error(`
PRODUCT PAGE VALIDATION FAILED

Expected: ${productName}
Got: ${actual}
`);
      }

      console.log(`Product validated: ${actual}`);

    } catch (err) {
      throw new Error(`
FAILED TO VALIDATE PRODUCT PAGE
${err.message}
`);
    }
  }

  /**
   * Select quantity and return extracted prices.
   */
  async selectQuantityOption(quantity) {
    try {
      const option = this.page.locator(
        `//a[@class="sku-step__option-item" and @data-value="${quantity}"]`
      );

      await option.waitFor({ state: "visible", timeout: 8000 });
      //await option.scrollIntoViewIfNeeded();
      await option.click();

      const selectedQuantity = await option.getAttribute("data-value");

      console.log(selectedQuantity)
      return { quantity: selectedQuantity};
     
    } catch (err) {
      throw new Error(`
QUANTITY NOT FOUND

Requested: ${quantity}

Error:
${err.message}
`);
    }
  }

  
  //Click "Add to cart".
   async addToCart() {
    try {
      const btn = this.page.locator(
        '//button[@type="submit"]//*[@class="button-text__upload"]'
        );
      await btn.waitFor({ state: "visible", timeout: 8000 });
      await btn.click();

      await this.page.waitForLoadState("networkidle");

    } catch (err) {
      throw new Error(`
ADD TO CART FAILED
${err.message}
`);
    }
  }

  
  //Collect all selected Product values.
  async getSelectedProductDetails() {
    const safe = async (xp) => {
      try {
        return (await this.page.locator(xp).textContent()).trim();
      } catch {
        return null;
      }
    };

    return {
      productName: await safe("h1"),

      quantity: await safe(
        "//div[contains(@class,'sku-step__header')]/h2/span[@class='sku-step__title-text']"
      ),

      colour: await safe(
        "(//div[contains(@class,'sku-step__header')])[1]//span[@data-selected-value-name]"
      ),

      // writingColour: await safe(
      //   "//h2[contains(., 'Writing Colour')]/span[@data-selected-value-name]"
      // ),

      // printTechnique: await safe(
      //   "//h2[contains(., 'Print Technique')]/span[@data-selected-value-name]"
      // ),

      // printingOption: await safe(
      //   "//h2[contains(., 'Printing Option')]/span[@data-selected-value-name]"
      // ),

      // delivery: await safe(
      //   "//h2[contains(., 'Delivery')]/span[@data-selected-value-name]"
      // ),

      pricePerPiece: await safe(
        "//*[contains(@class,'sku-step__option sku-step__option--active')]//div[contains(@class,'price--price-per-piece')]//span[@class='price__value']"
      ),

      totalPrice: await safe(
        "//div[contains(@class,'sku-total-price')]//span[contains(@class,'sku-total-price__value')]"
      ),

      selectedPrintrunValue: await this.page.evaluate(
        () => window.selectedPrintrunValue || null
      ),
    };
  }


  async navigateToProduct(mainHoverText, subHoverText, finalClickText) {
  try {
    // 1) Hover main menu item
    const mainMenu = this.page.locator(`//li[contains(@class,'menu-item') and contains(., '${mainHoverText}')]`);
    await mainMenu.waitFor({ state: "visible", timeout: 8000 });
    await mainMenu.hover();

    // 2) Hover sub menu item
    const subMenu = this.page.locator(`//a[contains(text(),'${subHoverText}')]`);
    await subMenu.waitFor({ state: "visible", timeout: 8000 });
    await subMenu.hover();

    // 3) Click final link
    const finalItem = this.page.locator(`//a[contains(@class,'header-mobile__sub-submenu-second-anchor') and contains(text(),'${finalClickText}')]`);
    await finalItem.waitFor({ state: "visible", timeout: 8000 });
    await finalItem.click();

  } catch (err) {
    throw new Error(`
      Navigation Failed!
      mainHoverText: ${mainHoverText}
      subHoverText: ${subHoverText}
      finalClickText: ${finalClickText}

      Error Message: ${err.message}
    `);
  }
}

async navigateToProductSub(mainHoverText, finalClickText) {
  try {
    // 1) Hover main menu item
    const mainMenu = this.page.locator(`//li[contains(@class,'menu-item') and contains(., '${mainHoverText}')]`);
    //await mainMenu.waitFor({ state: "visible", timeout: 8000 });
    await mainMenu.hover();

   // ) Click final link
    const finalItem = this.page.locator(`//a[@class="header__submenu-visual-title" and contains(text(),'${finalClickText}')]`);
    //await finalItem.waitFor({ state: "visible", timeout: 8000 });
    await finalItem.click();

  } catch (err) {
    throw new Error(`
      Navigation Failed!
      mainHoverText: ${mainHoverText}
      finalClickText: ${finalClickText}
      Error Message: ${err.message}
    `);
  }
}

}

module.exports = ProductPage;