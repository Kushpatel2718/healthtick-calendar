import type { Booking } from "../types/index";
import { addMinutesToTime, isTimeInRange } from "./timeUtils";

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
