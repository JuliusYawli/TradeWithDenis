"use client";

import { useState } from "react";

export function AdminPaymentFields({
  defaultCashOnly = false,
  weeklyPayment,
  downPaymentPercent = 40,
  installmentWeeks = 12
}: {
  defaultCashOnly?: boolean;
  weeklyPayment?: number | null;
  downPaymentPercent?: number;
  installmentWeeks?: number;
}) {
  const [paymentType, setPaymentType] = useState(defaultCashOnly ? "cash" : "installment");

  return (
    <>
      <label className="text-xs font-medium uppercase text-neutral-500">Payment type
        <select className="field mt-1" name="payment_type" value={paymentType} onChange={(event) => setPaymentType(event.target.value)}>
          <option value="installment">Weekly payment plan</option>
          <option value="cash">Cash only</option>
        </select>
      </label>
      {paymentType === "installment" ? (
        <>
          <label className="text-xs font-medium uppercase text-neutral-500">Weekly payment<input className="field mt-1" name="weekly_payment" type="number" placeholder="675" defaultValue={weeklyPayment || ""} /></label>
          <label className="text-xs font-medium uppercase text-neutral-500">Deposit %<input className="field mt-1" name="down_payment_percent" type="number" placeholder="40" defaultValue={downPaymentPercent} /></label>
          <label className="text-xs font-medium uppercase text-neutral-500">Payment weeks<input className="field mt-1" name="installment_weeks" type="number" placeholder="12" defaultValue={installmentWeeks} /></label>
        </>
      ) : null}
    </>
  );
}
