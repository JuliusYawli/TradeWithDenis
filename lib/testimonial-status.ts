export type TestimonialRequestStatus = "created" | "sent" | "submitted" | "approved" | "declined";

export function canSubmitTestimonial(status: TestimonialRequestStatus) {
  return status === "created" || status === "sent";
}
