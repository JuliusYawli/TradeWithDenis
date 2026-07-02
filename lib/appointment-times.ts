export const appointmentTimeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 7:00 PM"
] as const;

export function isAppointmentTimeSlot(value: string) {
  return appointmentTimeSlots.includes(value as (typeof appointmentTimeSlots)[number]);
}
