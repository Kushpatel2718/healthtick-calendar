export const generateTimeSlots = (): string[] => {
  const slots = [];
  const startHour = 10;
  const startMinute = 30;
  const endHour = 19;
  const endMinute = 30;

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const timeString = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
    slots.push(timeString);

    currentMinute += 20;
    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
  }

  return slots;
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const addMinutesToTime = (
  timeString: string,
  minutes: number
): string => {
  const [hours, mins] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export const isTimeInRange = (
  time: string,
  startTime: string,
  endTime: string
): boolean => {
  return time >= startTime && time < endTime;
};

export const getCurrentTimePosition = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Convert current time to minutes since midnight
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Calendar time range (10:30 AM to 7:30 PM)
  const startTimeInMinutes = 10 * 60 + 30; // 10:30 AM
  const endTimeInMinutes = 19 * 60 + 30; // 7:30 PM

  // If current time is outside calendar hours, return null
  if (
    currentTimeInMinutes < startTimeInMinutes ||
    currentTimeInMinutes > endTimeInMinutes
  ) {
    return null;
  }

  // Calculate position as percentage
  const totalCalendarDuration = endTimeInMinutes - startTimeInMinutes; // 540 minutes (9 hours)
  const timeFromStart = currentTimeInMinutes - startTimeInMinutes;
  const percentage = (timeFromStart / totalCalendarDuration) * 100;

  return {
    percentage,
    timeString: `${currentHour.toString().padStart(2, "0")}:${currentMinute
      .toString()
      .padStart(2, "0")}`,
    displayTime: formatTime(
      `${currentHour.toString().padStart(2, "0")}:${currentMinute
        .toString()
        .padStart(2, "0")}`
    ),
  };
};
