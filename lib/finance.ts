import type { Product } from "./types";

export function formatCedi(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0
  }).format(value);
}

export function financingFor(product: Pick<Product, "price" | "down_payment_percent" | "weekly_payment" | "installment_weeks">) {
  const downPayment = Math.round((product.price * product.down_payment_percent) / 100);
  const totalWeeklyPaid = product.weekly_payment * product.installment_weeks;
  const totalPaid = downPayment + totalWeeklyPaid;
  const financeCost = totalPaid - product.price;
  const financedBalance = product.price - downPayment;

  return { downPayment, totalWeeklyPaid, totalPaid, financeCost, financedBalance };
}
