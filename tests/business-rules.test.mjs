import assert from "node:assert/strict";
import test from "node:test";
import { allowedAdminEmails, isAllowedAdminEmail } from "../lib/admin.ts";
import { financingFor, isCashOnly } from "../lib/finance.ts";
import { canSubmitTestimonial } from "../lib/testimonial-status.ts";

test("admin authorization normalizes configured email addresses", () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = " Owner@Example.com, staff@example.com ";
  try {
    assert.deepEqual(allowedAdminEmails(), ["owner@example.com", "staff@example.com"]);
    assert.equal(isAllowedAdminEmail("OWNER@example.com"), true);
    assert.equal(isAllowedAdminEmail("attacker@example.com"), false);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = previous;
  }
});

test("financing totals remain internally consistent", () => {
  assert.deepEqual(financingFor({
    price: 5000,
    down_payment_percent: 40,
    weekly_payment: 300,
    installment_weeks: 12
  }), {
    downPayment: 2000,
    totalWeeklyPaid: 3600,
    totalPaid: 5600,
    financeCost: 600,
    financedBalance: 3000
  });
  assert.equal(isCashOnly({ weekly_payment: 0 }), true);
  assert.equal(isCashOnly({ weekly_payment: 300 }), false);
});

test("review links cannot be reused after submission or moderation", () => {
  assert.equal(canSubmitTestimonial("created"), true);
  assert.equal(canSubmitTestimonial("sent"), true);
  assert.equal(canSubmitTestimonial("submitted"), false);
  assert.equal(canSubmitTestimonial("approved"), false);
  assert.equal(canSubmitTestimonial("declined"), false);
});
