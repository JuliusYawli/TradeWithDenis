import assert from "node:assert/strict";
import test from "node:test";
import { BookingValidationError, parseBookingForm } from "../lib/booking.ts";

function validForm(overrides = {}) {
  const futureDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const values = {
    customer_name: "Ama Mensah",
    phone: "+233 20 123 4567",
    email: "AMA@example.com",
    preferred_contact_method: "whatsapp",
    desired_payment_option: "weekly",
    appointment_date: futureDate,
    appointment_time: "10:00 AM - 12:00 PM",
    message: "I would like to inspect the phone.",
    privacy_acknowledged: "on",
    ...overrides
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

test("accepts and normalizes a legitimate booking", () => {
  const booking = parseBookingForm(validForm());
  assert.equal(booking.lead.email, "ama@example.com");
  assert.equal(booking.lead.preferred_contact_method, "whatsapp");
  assert.equal(booking.appointmentTime, "10:00 AM - 12:00 PM");
});

test("rejects the honeypot used by automated submissions", () => {
  assert.throws(() => parseBookingForm(validForm({ website: "https://spam.example" })), BookingValidationError);
});

test("rejects forged select values and oversized input", () => {
  assert.throws(() => parseBookingForm(validForm({ preferred_contact_method: "carrier-pigeon" })), BookingValidationError);
  assert.throws(() => parseBookingForm(validForm({ message: "x".repeat(1001) })), BookingValidationError);
});

test("rejects invalid product identifiers and appointment slots", () => {
  assert.throws(() => parseBookingForm(validForm({ product_id: "1 OR 1=1" })), BookingValidationError);
  assert.throws(() => parseBookingForm(validForm({ appointment_time: "midnight" })), BookingValidationError);
});

test("rejects past dates, invalid phone numbers, and control characters", () => {
  assert.throws(() => parseBookingForm(validForm({ appointment_date: "2020-01-01" })), BookingValidationError);
  assert.throws(() => parseBookingForm(validForm({ phone: "call-me" })), BookingValidationError);
  assert.throws(() => parseBookingForm(validForm({ customer_name: "Ama\u0000Mensah" })), BookingValidationError);
  assert.throws(() => parseBookingForm(validForm({ appointment_date: "2027-02-29" })), BookingValidationError);
  assert.throws(() => parseBookingForm(validForm({ appointment_date: "2026-02-30" })), BookingValidationError);
});
