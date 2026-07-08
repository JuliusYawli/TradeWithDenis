import { CalendarCheck, LockKeyhole, Send } from "lucide-react";
import { submitLead } from "@/app/actions";
import { appointmentTimeSlots } from "@/lib/appointment-times";
import type { Product } from "@/lib/types";

export function LeadForm({ product, variant = "card" }: { product?: Product; variant?: "card" | "modal" }) {
  return (
    <form action={submitLead} className={variant === "card" ? "grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5" : "grid gap-3"}>
      {variant === "card" ? (
        <div className="mb-1">
          <div className="mb-2 inline-flex rounded-full bg-snow p-2">
            <CalendarCheck className="h-5 w-5 text-gold" />
          </div>
          <h3 className="text-xl font-semibold text-ink">Book a shop appointment</h3>
          <p className="mt-1 text-sm leading-6 text-neutral-600">
            Submit your details, then visit the shop to inspect the device, confirm payment terms, and complete the order in person.
          </p>
        </div>
      ) : null}
      <div className="rounded-lg border border-line bg-snow p-3 text-sm leading-6 text-neutral-700">
        <p className="inline-flex items-center gap-2 font-medium text-ink"><LockKeyhole className="h-4 w-4 text-gold" /> No online payment required</p>
        <p className="mt-1">Your appointment helps the shop prepare. You inspect the phone and complete the order in person.</p>
      </div>
      <input type="hidden" name="product_id" value={product?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="field" name="customer_name" placeholder="Full name" required />
        <input className="field" name="phone" placeholder="WhatsApp or phone" required />
      </div>
      <input className="field" type="email" name="email" placeholder="Email address" autoComplete="email" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-neutral-700">
          Preferred contact method
          <select className="field mt-2" name="preferred_contact_method" defaultValue="whatsapp">
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone call</option>
            <option value="email">Email</option>
          </select>
        </label>
        {product && (!product.weekly_payment || product.weekly_payment <= 0) ? (
          <label className="text-sm font-semibold text-neutral-700">
            Payment preference
            <input type="hidden" name="desired_payment_option" value="cash" />
            <p className="field mt-2 flex items-center bg-snow text-neutral-600">Cash — this phone is sold at cash price only</p>
          </label>
        ) : (
          <label className="text-sm font-semibold text-neutral-700">
            Payment preference
            <select className="field mt-2" name="desired_payment_option" defaultValue="weekly">
              <option value="weekly">Weekly payments</option>
              <option value="cash">Pay cash</option>
              <option value="discuss">Discuss options</option>
            </select>
          </label>
        )}
      </div>
      {(() => {
        const storages = product
          ? [product.storage, ...(product.storage_options ?? []).map((option) => option.storage)].filter(
              (storage, index, all) => storage && all.indexOf(storage) === index
            )
          : [];
        return storages.length > 1 ? (
          <label className="text-sm font-semibold text-neutral-700">
            Preferred storage
            <select className="field mt-2" name="preferred_storage" defaultValue="">
              <option value="">Choose storage</option>
              {storages.map((storage) => (
                <option key={storage} value={storage}>{storage}</option>
              ))}
            </select>
          </label>
        ) : null;
      })()}
      {product?.colors?.length ? (
        <label className="text-sm font-semibold text-neutral-700">
          Preferred color
          <select className="field mt-2" name="preferred_color" defaultValue="">
            <option value="">Choose a color</option>
            {product.colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
            <option value="Not sure — discuss at shop">Not sure — discuss at shop</option>
          </select>
        </label>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-neutral-700">
          Preferred appointment date
          <input className="field mt-2" name="appointment_date" type="date" />
        </label>
        <label className="text-sm font-semibold text-neutral-700">
          Preferred appointment time
          <select className="field mt-2" name="appointment_time" defaultValue="">
            <option value="">Choose time</option>
            {appointmentTimeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </label>
      </div>
      <textarea className="field min-h-28" name="message" placeholder={product ? `I want to book a shop visit for ${product.model} ${product.storage}` : "Tell us what device you want to inspect at the shop"} />
      <button className="btn-primary" type="submit">
        <Send className="h-4 w-4" />
        Book appointment
      </button>
    </form>
  );
}
