// pages/CartPage.js

const BasePage = require("./BasePage.js");


class CartPage extends BasePage {
  constructor(page) {
    super(page);

    // Overview summary tables (from "Overview" section)
    this.overviewRows = "//div[@id='cart-summary__table']//table[contains(@class,'cart-summary__table')][1]//tr";
    this.subtotalRows = "//div[@id='cart-summary__table']//table[contains(@class,'cart-summary__table')][2]//tr";
    this.totalRow = "//div[@id='cart-summary__table']//table[contains(@class,'cart-summary__table')][3]//tr/td[@class='table-cell table-cell--value']";

    // Product details table (per-item details)
    this.detailsTableRows = "//table[contains(@class,'new-cart-item__details-table')]//tr";

    // Product title in cart
    this.cartTitle = "//h2[@class='new-cart-item__heading']";

    // Continue button
    this.continueBtn = "//button[@id='cart-summary-continue']";

    //Delete product 
    this.emptyCartMessage = page.locator('//h1[@class="home-block-s__title"]'); // ✅ a Locator

  }


  async isCartEmpty() {
    await this.emptyCartMessage.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
    const visible = await this.emptyCartMessage.isVisible();
     if (!visible) {
       throw new Error("Your Cart is NOT empty!");
    }
  console.log(" Your Cart is empty");
}

  // ------------------------------
  // Helper: read overview & subtotal & total into map
  // ------------------------------
  async getCartOverviewMap() {
    const map = {};

    // first table (Total articles + extras)
    const overviewRows = await this.page.$$(this.overviewRows);
    for (const row of overviewRows) {
      const key = await row.$eval("td.table-cell--key", el => el.textContent.trim()).catch(() => null);
      const value = await row.$eval("td.table-cell--value", el => el.textContent.trim()).catch(() => null);
      if (key) map[key] = value;
    }

    // second table (Subtotal + VAT)
    const subtotalRows = await this.page.$$(this.subtotalRows);
    for (const row of subtotalRows) {
      const key = await row.$eval("td.table-cell--key", el => el.textContent.trim()).catch(() => null);
      const value = await row.$eval("td.table-cell--value", el => el.textContent.trim()).catch(() => null);
      if (key) map[key] = value;
    }

    // final total
    const totalText = await this.getText(this.totalRow).catch(() => null);
    if (totalText) map["Total"] = totalText.trim();

    return map;
  }




  
  // ------------------------------
  // Helper: read product details table into map
  // ------------------------------
  async getCartItemDetailsMap() {
    const map = {};
    const rows = await this.page.$$(this.detailsTableRows);

    for (const row of rows) {
      const key = await row.$eval("td.new-cart-item__details-table--cell-title", el => el.textContent.trim()).catch(() => null);
      // some titles are wrapped in <strong> so normalize
      const normalizedKey = key ? key.replace(/\s+/g, ' ').trim() : null;
      const value = await row.$eval("td.new-cart-item__details-table--cell-value", el => el.textContent.trim()).catch(() => null);

      if (normalizedKey) map[normalizedKey] = value;
    }

    return map;
  }

  // ------------------------------
  // Master validation that checks EVERYTHING against productDetails
  //
  // expected product object (example):
  // {
  //   productName: "Ebony Pens Matte",
  //   quantity: "500",
  //   colour: "Black",
  //   writingColour: "Blue",
  //   amountOfColours: "Laser Engraving",
  //   printingOption: "60 x 5 mm",
  //   printTechnique: "Laser Engraving",
  //   delivery: "Five working days",
  //
  //   // prices from product page
  //   totalPrice: "€292.99",        // total articles
  //   subtotal: "€306.98",
  //   vat: "€70.61",
  //   finalTotal: "€377.59"
  // }
  // ------------------------------


async UpdatevalidateCartUsingProductDetails(productDetails) {
  console.log("---- VALIDATING CART DETAILS (LANGUAGE-INDEPENDENT) ----");

  // get ALL rows from cart details table
  const rows = await this.page.locator("//table[@class='new-cart-item__details-table']/tbody/tr");

  const rowCount = await rows.count();
  console.log("Found rows:", rowCount);

  const mapping = [
    { index: 0, key: "quantity" },
    { index: 1, key: "colour" },
    { index: 2, key: "writingColour" }
   // { index: 3, key: "printTechnique" },   // sometimes combined
   // { index: 4, key: "printingOption" },
    //{ index: 5, key: "printTechnique" },
    //{ index: 6, key: "delivery" }
  ];

  for (const m of mapping) {
    if (!productDetails[m.key]) {
      console.log(`Skipping ${m.key} (value not present on PDP)`);
      continue;
    }

    const cartValue = (await rows.nth(m.index)
      .locator("td.new-cart-item__details-table--cell-value")
      .innerText()).trim();

    const expectedPdpValue = productDetails[m.key].trim();

    if (!cartValue.includes(expectedPdpValue)) {
      throw new Error(`
  CART VALIDATION FAILED for ${m.key}

Expected (from PDP): ${expectedPdpValue}
Actual (in Cart):   ${cartValue}
`);
    }

    console.log(`${m.key} matched: ${cartValue}`);
  }
}

  async validateCartUsingProductDetails(expected) {
    console.log("\n===== CART VALIDATION START =====\n");

    // 1) validate product title in cart
    const cartTitleText = (await this.getText(this.cartTitle)).trim();
    if (!cartTitleText.toLowerCase().includes((expected.productName || "").toLowerCase())) {
      throw new Error(` Product title mismatch. Expected contains: "${expected.productName}", Found: "${cartTitleText}"`);
    }
    console.log(`Product title validated: ${cartTitleText}`);

    // 2) validate details table entries
    const detailsMap = await this.getCartItemDetailsMap();
    console.log("DEBUG detailsMap:", detailsMap);

    const detailChecks = [
      { key: "Print run", expectedKey: "quantity" },
      { key: "Colours", expectedKey: "colour" },
      //{ key: "Writing Colour", expectedKey: "writingColour" },
      { key: "Amount of colours in your design", expectedKey: "amountOfColours" },
      { key: "Printing Option", expectedKey: "printingOption" },
      { key: "Print Technique", expectedKey: "printTechnique" },
      { key: "Delivery", expectedKey: "delivery" }
    ];

    for (const check of detailChecks) {
      const cartLabel = check.key;
      const expectedValue = expected[check.expectedKey];
      if (expectedValue === undefined || expectedValue === null) {
        // skip if caller didn't provide expected value
        continue;
      }

      const actualValue = detailsMap[cartLabel];
      if (actualValue === undefined) {
        throw new Error(`Cart detail missing: "${cartLabel}". Expected: "${expectedValue}"`);
      }

      // Compare normalized strings (trim + collapse spaces)
      const normActual = actualValue.replace(/\s+/g, ' ').trim();
      const normExpected = String(expectedValue).replace(/\s+/g, ' ').trim();

      if (normActual !== normExpected) {
        throw new Error(`Cart detail mismatch for "${cartLabel}" → Expected: "${normExpected}", Found: "${normActual}"`);
      }

      console.log(`Cart detail matched: ${cartLabel} → ${normActual}`);
    }

    // 3) validate overview/pricing values
    const overviewMap = await this.getCartOverviewMap();
    console.log("DEBUG overviewMap:", overviewMap);

    // total articles (should match totalPrice)
    if (expected.totalPrice !== undefined && expected.totalPrice !== null) {
      const actualTotalArticles = overviewMap["Total articles"];
      if (!actualTotalArticles) throw new Error(`"Total articles" not found in overview`);
      if (actualTotalArticles !== expected.totalPrice) {
        throw new Error(`"Total articles" mismatch → Expected: ${expected.totalPrice}, Found: ${actualTotalArticles}`);
      }
      console.log(` Total articles matched: ${actualTotalArticles}`);
    }

    // subtotal
    if (expected.subtotal !== undefined && expected.subtotal !== null) {
      const actualSubtotal = overviewMap["Subtotal"];
      if (!actualSubtotal) throw new Error(` "Subtotal" not found in overview`);
      if (actualSubtotal !== expected.subtotal) {
        throw new Error(`"Subtotal" mismatch → Expected: ${expected.subtotal}, Found: ${actualSubtotal}`);
      }
      console.log(`Subtotal matched: ${actualSubtotal}`);
    }

    // VAT
    if (expected.vat !== undefined && expected.vat !== null) {
      const actualVat = overviewMap["VAT"];
      if (!actualVat) throw new Error(` "VAT" not found in overview`);
      if (actualVat !== expected.vat) {
        throw new Error(`"VAT" mismatch → Expected: ${expected.vat}, Found: ${actualVat}`);
      }
      console.log(` VAT matched: ${actualVat}`);
    }

    // final total
    if (expected.finalTotal !== undefined && expected.finalTotal !== null) {
      const actualFinal = overviewMap["Total"];
      if (!actualFinal) throw new Error(` "Total" not found in overview`);
      if (actualFinal !== expected.finalTotal) {
        throw new Error(` "Total" mismatch → Expected: ${expected.finalTotal}, Found: ${actualFinal}`);
      }
      console.log(`Final total matched: ${actualFinal}`);
    }

    console.log("\n===== CART VALIDATION PASSED =====\n");
  }

  // ------------------------------
  // click continue to go to checkout
  // ------------------------------
  async continueToCheckout() {
    await this.click(this.continueBtn);
    await this.page.waitForLoadState("networkidle");
  }
}

module.exports = CartPage;
