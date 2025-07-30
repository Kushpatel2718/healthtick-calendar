//import { Booking } from "../types/index";
import { addMinutesToTime, isTimeInRange } from "./timeUtils";

interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  callType: "onboarding" | "follow-up";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isRecurring: boolean;
  originalDate?: string; // For recurring calls, this is the first occurrence
}

export const getRecurringBookings = (
  bookings: Booking[],
  targetDate: string
): Booking[] => {
  const targetDateObj = new Date(targetDate + "T00:00:00");
  const targetDay = targetDateObj.getDay();

  return bookings
    .filter((booking) => booking.isRecurring && booking.originalDate)
    .filter((booking) => {
      const originalDateObj = new Date(booking.originalDate! + "T00:00:00");
      const originalDay = originalDateObj.getDay();
      return (
        originalDay === targetDay &&
        new Date(booking.originalDate! + "T00:00:00") <= targetDateObj
      );
    })
    .map((booking) => ({
      ...booking,
      date: targetDate,
      id: `${booking.id}-${targetDate}`, // Unique ID for this occurrence
    }));
};

export const hasConflict = (
  time: string,
  duration: number,
  dayBookings: Booking[]
): boolean => {
  const endTime = addMinutesToTime(time, duration);

  return dayBookings.some((booking) => {
    const bookingDuration = booking.callType === "onboarding" ? 40 : 20;
    const bookingEndTime = addMinutesToTime(booking.time, bookingDuration);

    // Check if times overlap
    return (
      isTimeInRange(time, booking.time, bookingEndTime) ||
      isTimeInRange(booking.time, time, endTime) ||
      time === booking.time
    );
  });
};
