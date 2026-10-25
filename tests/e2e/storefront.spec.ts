import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("twd-cookie-consent", "rejected"));
});

test("customer can browse, compare, and open product details", async ({ page }) => {
  await page.goto("/iphones");
  await expect(page.getByRole("heading", { name: /choose an iphone/i })).toBeVisible();
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
