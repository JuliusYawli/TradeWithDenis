import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("twd-cookie-consent", "rejected"));
});

test("customer can browse, compare, and open product details", async ({ page }) => {
  await page.goto("/iphones");
  await expect(page.getByPlaceholder("Search model or storage")).toBeVisible();
  const compareButtons = page.getByRole("button", { name: /compare this iphone/i });
  await compareButtons.nth(0).click();
  await compareButtons.nth(1).click();
  await expect(page.getByTestId("comparison-table")).toBeVisible();
  await page.getByRole("link", { name: /view iphone/i }).first().click();
  await expect(page.getByTestId("product-gallery")).toBeVisible();
});

test("booking form validates and reaches a safe result without local Supabase", async ({ page }) => {
  await page.goto("/contact");
  await page.getByPlaceholder("Full name").fill("Test Customer");
  await page.getByPlaceholder("WhatsApp or phone").fill("+233 20 123 4567");
  await page.getByPlaceholder("Email address").fill("customer@example.com");
  await page.getByRole("checkbox").check();
  await page.locator("form").filter({ has: page.getByPlaceholder("Full name") }).getByRole("button", { name: "Book appointment", exact: true }).click();
  await expect(page).toHaveURL(/appointment-confirmed/);
  await expect(page.getByRole("heading", { name: /contact the shop to confirm/i })).toBeVisible();
});

test("admin workspace and login screen render", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Admin login" })).toBeVisible();
  await page.goto("/admin#products");
  await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Products", exact: true })).toBeVisible();
});

test("admin navigation and safe controls work", async ({ page }) => {
  await page.goto("/admin#overview");

  for (const section of ["appointments", "leads", "add-product", "products", "backups", "settings", "password", "testimonials"]) {
    if ((page.viewportSize()?.width ?? 0) >= 1024) await page.locator(`aside a[href="#${section}"]`).click();
    else {
      const mobileMenu = page.getByText("Admin sections", { exact: true });
      if ((await page.locator("details").first().getAttribute("open")) === null) await mobileMenu.click();
      await page.locator(`details a[href="#${section}"]`).click();
    }
    await expect(page.locator(`#${section}`)).toBeVisible();
  }

  await page.goto("/admin#overview");
  await page.getByRole("button", { name: /total products/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /close details/i }).click();

  await page.goto("/admin#add-product");
  const form = page.locator("#add-product form");
  await form.getByLabel("Pricing template").selectOption("iphone-11-pro-64gb-used");
  await expect(form.getByLabel("Model", { exact: true })).toHaveValue("iPhone 11 Pro");
  await expect(form.getByLabel("Price", { exact: true })).toHaveValue("2900");
  await form.getByLabel("Payment type").selectOption("cash");
  await expect(form.locator('input[name="weekly_payment"]')).toHaveCount(0);
  await form.getByRole("button", { name: /add another storage/i }).click();
  await expect(form.getByLabel("Storage option 1", { exact: true })).toBeVisible();
  await form.getByRole("button", { name: /remove storage option/i }).click();
  await expect(form.getByLabel("Storage option 1", { exact: true })).toHaveCount(0);

  await page.goto("/admin#products");
  await page.locator("#products details").first().locator("summary").click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: /delete product/i }).first().click();
  await expect(page.locator("#products details")).toHaveCount(6);
});

test("invalid review link fails closed", async ({ page }) => {
  await page.goto("/review/not-a-real-token");
  await expect(page.getByRole("heading", { name: "Review link unavailable" })).toBeVisible();
});

test("custom 404 provides recovery navigation", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "That page is not available." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});
