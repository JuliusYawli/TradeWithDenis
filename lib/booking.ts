import { isAppointmentTimeSlot } from "./appointment-times.ts";

const contactMethods = new Set(["whatsapp", "phone", "email"]);
const paymentOptions = new Set(["weekly", "cash", "discuss"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const phonePattern = /^[+0-9(). -]{7,25}$/;
const controlCharacterPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export class BookingValidationError extends Error {}

function field(formData: FormData, name: string, maxLength: number) {
  const value = String(formData.get(name) || "").trim();
  if (value.length > maxLength) throw new BookingValidationError(`${name} is too long.`);
  if (controlCharacterPattern.test(value)) throw new BookingValidationError(`${name} contains invalid characters.`);
  return value;
}

export function parseBookingForm(formData: FormData) {
  const customerName = field(formData, "customer_name", 100);
  const phone = field(formData, "phone", 40);
  const email = field(formData, "email", 254).toLowerCase();
  const productId = field(formData, "product_id", 36);
  const preferredContactMethod = field(formData, "preferred_contact_method", 20) || "whatsapp";
  const desiredPaymentOption = field(formData, "desired_payment_option", 20);
  const preferredStorage = field(formData, "preferred_storage", 30);
  const preferredColor = field(formData, "preferred_color", 60);
  const customerMessage = field(formData, "message", 1000);
  const appointmentDate = field(formData, "appointment_date", 10);
  const appointmentTime = field(formData, "appointment_time", 30);
  const website = field(formData, "website", 200);
  const privacyAcknowledged = formData.get("privacy_acknowledged") === "on";

  if (website) throw new BookingValidationError("Automated booking rejected.");
  if (!privacyAcknowledged) throw new BookingValidationError("Privacy acknowledgement is required.");
  if (!customerName || !phone || !email) throw new BookingValidationError("Name, phone, and email are required.");
  if (!emailPattern.test(email)) throw new BookingValidationError("A valid email address is required.");
  if (!phonePattern.test(phone)) throw new BookingValidationError("A valid phone number is required.");
  if (productId && !uuidPattern.test(productId)) throw new BookingValidationError("The selected product is invalid.");
  if (!contactMethods.has(preferredContactMethod)) throw new BookingValidationError("The preferred contact method is invalid.");
  if (desiredPaymentOption && !paymentOptions.has(desiredPaymentOption)) throw new BookingValidationError("The payment option is invalid.");
  if (appointmentDate) {
    const match = datePattern.exec(appointmentDate);
    const requestedDate = match ? new Date(Date.UTC(Number(match[0].slice(0, 4)), Number(match[0].slice(5, 7)) - 1, Number(match[0].slice(8, 10)))) : null;
    if (!requestedDate || requestedDate.toISOString().slice(0, 10) !== appointmentDate) {
      throw new BookingValidationError("The appointment date is invalid.");
    }
    const requestedDay = Date.parse(`${appointmentDate}T00:00:00Z`);
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    if (requestedDay < todayUtc || requestedDay > todayUtc + 180 * 86400000) {
      throw new BookingValidationError("The appointment date must be within the next 180 days.");
    }
  }
  if (appointmentTime && !isAppointmentTimeSlot(appointmentTime)) throw new BookingValidationError("The appointment time is invalid.");

  return {
    lead: {
      product_id: productId || null,
      customer_name: customerName,
      phone,
      email,
      preferred_contact_method: preferredContactMethod,
      desired_payment_option: desiredPaymentOption || null,
      message: [
        preferredStorage ? `Preferred storage: ${preferredStorage}.` : "",
        preferredColor ? `Preferred color: ${preferredColor}.` : "",
        customerMessage
      ].filter(Boolean).join(" ") || null
    },
    appointmentDate: appointmentDate || null,
    appointmentTime: appointmentTime || null
  };
}
