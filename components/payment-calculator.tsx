"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { formatCedi } from "@/lib/finance";

export function PaymentCalculatorPanel() {
  const [price, setPrice] = useState(7000);
  const [percent, setPercent] = useState(40);
  const [weeks, setWeeks] = useState(12);
  const [weekly, setWeekly] = useState(525);

  const result = useMemo(() => {
    const downPayment = Math.round((price * percent) / 100);
    const financedBalance = price - downPayment;
    const totalWeeklyPaid = weekly * weeks;
    const totalPaid = downPayment + totalWeeklyPaid;
    const financeCost = totalPaid - price;
    return { downPayment, financedBalance, totalWeeklyPaid, totalPaid, financeCost };
  }, [price, percent, weeks, weekly]);

  return (
    <div className="grid gap-4 text-ink md:grid-cols-2">
      <label className="text-sm font-semibold">Device price<input className="field mt-2" type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
      <label className="text-sm font-semibold">Deposit percent<input className="field mt-2" type="number" value={percent} onChange={(event) => setPercent(Number(event.target.value))} /></label>
      <label className="text-sm font-semibold">Weekly payment<input className="field mt-2" type="number" value={weekly} onChange={(event) => setWeekly(Number(event.target.value))} /></label>
      <label className="text-sm font-semibold">Installment weeks<input className="field mt-2" type="number" value={weeks} onChange={(event) => setWeeks(Number(event.target.value))} /></label>
      {Object.entries({
        "Down payment": result.downPayment,
        "Financed balance": result.financedBalance,
        "Total weekly paid": result.totalWeeklyPaid,
        "Total paid": result.totalPaid,
        "Finance cost": result.financeCost
      }).map(([label, value]) => (
        <div key={label} className="rounded-md bg-snow p-4">
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-xl font-black">{formatCedi(value)}</p>
        </div>
      ))}
    </div>
  );
}

export function PaymentCalculator() {
  return (
    <section id="calculator" className="bg-ink py-16 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-4 inline-flex rounded-full bg-white/10 p-3">
            <Calculator className="h-6 w-6 text-gold" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Transparent payment calculator</h2>
          <p className="mt-3 max-w-xl text-white/70">
            Every device shows the deposit, weekly commitment, total paid, financed balance, and finance cost before you reserve.
          </p>
        </div>
        <div className="grid gap-4 rounded-lg border border-white/10 bg-white p-5 text-ink md:grid-cols-2">
          <PaymentCalculatorPanel />
        </div>
      </div>
    </section>
  );
}
