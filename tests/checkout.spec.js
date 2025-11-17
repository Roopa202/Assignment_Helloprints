// tests/ebony-pens-checkout.spec.js

const { test } = require("@playwright/test");

const HomePage = require("../pages/HomePage");
const ProductPage = require("../pages/ProductPage");
const CartPage = require("../pages/CartPage");

//Part 2 - Open Ended Task
//Test 1 - Search a product using Search Functionality
test("E2E → Ireland → Ebony Pens Matte → Qty 50 → Validate Cart", async ({ page }) => {

  const home = new HomePage(page);
  const productPage = new ProductPage(page);
  const cart = new CartPage(page);

  const baseURL = "https://www.helloprint.ie";

  console.log("===== START TEST =====");

  // 1) OPEN HOME PAGE
  await home.openHomePage(baseURL);
  
  // 2) SELECT PRODUCT FROM SUGGESTION
  await productPage.selectProductUsingSearch("Ebony Pens Matte");

  // 3) SELECT QUANTITY
  await productPage.selectQuantityOption("50");

  // 4) GET PRODUCT DETAILS
  const productDetails = await productPage.getSelectedProductDetails();
  console.log("PRODUCT DETAILS:", productDetails);

  // 5) ADD TO CART
  await productPage.addToCart();
   
  // 6) VALIDATE CART VALUES
  await cart.UpdatevalidateCartUsingProductDetails(productDetails);

  console.log("===== TEST COMPLETED SUCCESSFULLY =====");
});

// Open Ended Task 
// Test 2 - Remove the product from the cart and validate the empty cart
test("E2E → Ireland → Delete the product + Validate Cart is empty ", async ({ page }) => {

  const home = new HomePage(page);
  const productPage = new ProductPage(page);
  const cart = new CartPage(page);

  const baseURL = "https://www.helloprint.ie";

  console.log("===== START TEST =====");

  // 1) OPEN HOME PAGE
  await home.openHomePage(baseURL);
  
  // 2) SELECT PRODUCT FROM SUGGESTION
  await productPage.selectProductUsingSearch("Ebony Pens Matte");

  // 3) SELECT QUANTITY
  await productPage.selectQuantityOption("50");

  // 4) GET PRODUCT DETAILS
  const productDetails = await productPage.getSelectedProductDetails();
  console.log("PRODUCT DETAILS:", productDetails);

  // 5) ADD TO CART
  await productPage.addToCart();

  // 6) REMOVE THE PRODUCT FROM CART 
  await page.locator("//div[contains(@class,'new-cart-item__actions')]//button[last()]").click();
 
  // 7) VALIDATE THE CART IS EMPTY
  await cart.isCartEmpty();

  console.log("===== TEST COMPLETED SUCCESSFULLY =====");
});


//Part-1 Directed Task LANGUAGE ENGLISH
//Test 1 - Checkout flow with English Language
test("E2E → United Kingdom → Ebony Pens Matte → Qty 50 → Validate Cart", async ({ page }) => {

  const home = new HomePage(page);
  const productPage = new ProductPage(page);
  const cart = new CartPage(page);

  const baseURL = "https://www.helloprint.co.uk";

  console.log("===== START TEST =====");

  // 1) OPEN HOME PAGE
  await home.openHomePage(baseURL);
  
  // 2) SELECT PRODUCT FROM SUGGESTION
  await productPage.selectProductUsingSearch("Ebony Pens Matte");

  // 3) SELECT QUANTITY
  await productPage.selectQuantityOption("50");

  // 4) GET PRODUCT DETAILS
  const productDetails = await productPage.getSelectedProductDetails();
  console.log("PRODUCT DETAILS:", productDetails);

  // 5) ADD TO CART
  await productPage.addToCart();
 
  // 6) VALIDATE CART VALUES
  await cart.UpdatevalidateCartUsingProductDetails(productDetails);

  console.log("===== TEST COMPLETED SUCCESSFULLY =====");
});


//Part-1 Directed Task - SPAINISH LANGUAGE
//Test 1 - Checkout flow with English Language
test("E2E → Spain → Ebony Pens Matte → Qty 50 → Validate Cart", async ({ page }) => {

  const home = new HomePage(page);
  const productPage = new ProductPage(page);
  const cart = new CartPage(page);

  const baseURL = "https://www.helloprint.ie";

  console.log("===== START TEST =====");

  // 1) OPEN HOME PAGE
  await home.openHomePage(baseURL);

  // 2) SELECT LANGUAGE → This opens new tab
  const newPage = await home.changeLanguage("Spain");

  // 3) UPDATE all Page Objects to use the new page tab
  home.page = newPage;
  productPage.page = newPage;
  cart.page = newPage;
  const UpdatedbaseURL = "https://www.helloprint.com/es-es/boligrafoebonymatte?printrun=500";
  await home.openHomePage(UpdatedbaseURL);

// REFRESH PAGE
// await newPage.reload();
// await newPage.waitForLoadState("networkidle");
// console.log("✔ Page refreshed after language switch");
 
//   // 4) SELECT FROM SUGGESTION
//   //await productPage.selectProductUsingSearch("Ebony Pens Matte");
//   await productPage.navigateToProductSub("Regalos de empresa", "Bolígrafos");

//   await productPage.selectProduct("Bolígrafo premium")

  // 4) SELECT QUANTITY
  await productPage.selectQuantityOption("50");

  // 5) GET PDP DETAILS
  const productDetails = await productPage.getSelectedProductDetails();
  console.log("PRODUCT DETAILS:", productDetails);

  // 6) ADD TO CART
  await productPage.addToCart();

  // 7) VALIDATE CART VALUES
  await cart.UpdatevalidateCartUsingProductDetails(productDetails);

  console.log("===== TEST COMPLETED SUCCESSFULLY =====");
});


