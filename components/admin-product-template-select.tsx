"use client";

import { iphonePricingTemplates, stockImageForTemplate } from "@/lib/iphone-pricing";
import { formatCedi } from "@/lib/finance";

function setField(form: HTMLFormElement, name: string, value: string | number) {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;

  field.value = String(value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

export function AdminProductTemplateSelect() {
  return (
    <label className="block rounded-lg border border-line bg-white p-4 text-xs font-medium uppercase text-neutral-500">
      Pricing template
      <select
        className="field mt-2 bg-white"
        defaultValue=""
        onChange={(event) => {
          const template = iphonePricingTemplates.find((item) => item.slug === event.currentTarget.value);
          const form = event.currentTarget.form;
          if (!template || !form) return;

          setField(form, "model", template.model);
          setField(form, "slug", template.slug);
          setField(form, "storage", template.storage);
          setField(form, "condition", template.condition);
          setField(form, "price", template.price);
          setField(form, "weekly_payment", template.weeklyPayment);
          setField(form, "down_payment_percent", template.downPaymentPercent);
          setField(form, "installment_weeks", template.installmentWeeks);
          setField(form, "warranty_months", template.warrantyMonths);
          setField(form, "image_urls", stockImageForTemplate(template));
          setField(
            form,
            "description",
            `${template.condition} ${template.model} ${template.storage} with ${template.downPaymentPercent}% deposit, ${formatCedi(template.weeklyPayment)} weekly payment, and ${template.installmentWeeks}-week payment term.`
          );
        }}
      >
        <option value="">Select a model, storage, and condition</option>
        {iphonePricingTemplates.map((template) => (
          <option key={template.slug} value={template.slug}>
            {template.label} - {formatCedi(template.price)} / {formatCedi(template.weeklyPayment)} weekly
          </option>
        ))}
      </select>
      <span className="mt-2 block text-xs normal-case leading-5 text-neutral-500">
        Selecting a template fills model, storage, condition, price, deposit, weekly payment, term, warranty, slug, description, and a temporary stock photo. You can still edit anything before saving.
      </span>
    </label>
  );
}
