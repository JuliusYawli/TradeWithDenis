import type { Product } from "./types";

type AppointmentNotificationInput = {
  lead: {
    customer_name: string;
    phone: string;
    email: string | null;
    preferred_contact_method: string;
    desired_payment_option: string | null;
    message: string | null;
  };
  appointmentDate: string | null;
  appointmentTime: string | null;
  product: Pick<Product, "brand" | "model" | "storage" | "price" | "weekly_payment"> | null;
};

type AppointmentUpdateNotificationInput = {
  lead: {
    customer_name: string;
    email: string | null;
  };
  status: string;
  appointmentDate: string | null;
  appointmentTime: string | null;
};

const resendApiKey = process.env.RESEND_API_KEY;
const shopNotificationEmail = process.env.SHOP_NOTIFICATION_EMAIL || process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
const emailFrom = process.env.EMAIL_FROM || "TradeWithDenis <onboarding@resend.dev>";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0
  }).format(amount);
}

function appointmentLine(date: string | null, time: string | null) {
  if (date && time) return `${date} at ${time}`;
  if (date) return date;
  if (time) return time;
  return "Customer did not choose a specific date/time.";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "pending",
    confirmed: "confirmed",
    postponed: "postponed",
    completed: "completed",
    cancelled: "cancelled",
    no_show: "no-show"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function statusMessage(status: string) {
  const messages: Record<string, string> = {
    pending: "Your appointment request is still pending. The shop will contact you to confirm the details.",
    confirmed: "Your shop visit has been confirmed. Please come at the agreed date and time.",
    postponed: "Your appointment has been postponed. Please check the updated visit date and time below.",
    completed: "Your appointment has been marked as completed. Thank you for visiting TradeWithDenis.",
    cancelled: "Your appointment has been cancelled. You can contact the shop if you want to book another visit.",
    no_show: "Your appointment has been marked as missed. Contact the shop if you want to arrange another visit."
  };
  return messages[status] ?? "Your appointment status has been updated.";
}

function escapeHtml(value: string | null) {
  if (!value) return "";
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not set. Skipping email notification.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: emailFrom,
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${details}`);
  }
}

export async function sendAppointmentNotifications({
  lead,
  appointmentDate,
  appointmentTime,
  product
}: AppointmentNotificationInput) {
  const appointment = appointmentLine(appointmentDate, appointmentTime);
  const productLine = product
    ? `${product.brand} ${product.model} ${product.storage} - ${formatMoney(product.price)} / ${formatMoney(product.weekly_payment)} weekly`
    : "No specific product selected";
  const customerName = escapeHtml(lead.customer_name);
  const safePhone = escapeHtml(lead.phone);
  const safeEmail = escapeHtml(lead.email);
  const preferredContact = escapeHtml(lead.preferred_contact_method);
  const paymentOption = escapeHtml(lead.desired_payment_option);
  const message = escapeHtml(lead.message);

  const shopHtml = `
    <h2>New shop visit booking</h2>
    <p>A customer has requested an in-shop appointment. No sale has been completed online.</p>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Phone:</strong> ${safePhone}</p>
    <p><strong>Email:</strong> ${safeEmail || "Not provided"}</p>
    <p><strong>Preferred contact:</strong> ${preferredContact}</p>
    <p><strong>Appointment:</strong> ${escapeHtml(appointment)}</p>
    <p><strong>Product:</strong> ${escapeHtml(productLine)}</p>
    <p><strong>Payment option:</strong> ${paymentOption || "Not selected"}</p>
    <p><strong>Message:</strong> ${message || "No message"}</p>
  `;

  const customerHtml = `
    <h2>Your TradeWithDenis visit request is received</h2>
    <p>Hi ${customerName},</p>
    <p>Thank you for booking a shop visit with TradeWithDenis. Your request has been received, and the team will contact you to confirm the details.</p>
    <p><strong>Requested appointment:</strong> ${escapeHtml(appointment)}</p>
    <p><strong>Product:</strong> ${escapeHtml(productLine)}</p>
    <p>Please remember that no sale is completed online. You will need to visit the shop to inspect the phone, confirm financing terms, and complete the order.</p>
  `;

  const tasks: Promise<void>[] = [];

  if (shopNotificationEmail) {
    tasks.push(sendEmail(shopNotificationEmail, "New TradeWithDenis shop visit booking", shopHtml));
  }

  if (lead.email) {
    tasks.push(sendEmail(lead.email, "Your TradeWithDenis visit request", customerHtml));
  }

  if (!tasks.length) return;

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error(result.reason);
    }
  }
}

export async function sendAppointmentUpdateNotification({
  lead,
  status,
  appointmentDate,
  appointmentTime
}: AppointmentUpdateNotificationInput) {
  if (!lead.email) return;

  const customerName = escapeHtml(lead.customer_name);
  const appointment = appointmentLine(appointmentDate, appointmentTime);
  const safeStatus = escapeHtml(statusLabel(status));
  const safeMessage = escapeHtml(statusMessage(status));

  const html = `
    <h2>Your TradeWithDenis appointment was updated</h2>
    <p>Hi ${customerName},</p>
    <p>${safeMessage}</p>
    <p><strong>Status:</strong> ${safeStatus}</p>
    <p><strong>Appointment:</strong> ${escapeHtml(appointment)}</p>
    <p>No sale is completed online. You will inspect the device and complete payment or financing at the shop.</p>
  `;

  try {
    await sendEmail(lead.email, `TradeWithDenis appointment ${statusLabel(status)}`, html);
  } catch (error) {
    console.error(error);
  }
}
