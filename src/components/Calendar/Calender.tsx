import React from "react";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactCalendarStyleProps } from "../../types";

const ReactCalendarStyle = ({
  selectedDate,
  onDateSelect,
  onClose,
}: ReactCalendarStyleProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Parse the selectedDate as local date (without time)
    const [year, month] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, 1); // month is 0-indexed in Date
  });

  // Create today's date without time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse selected date as local date
  const selectedDateObj = new Date(selectedDate);
  selectedDateObj.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "next" | "prev") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    // Format the date as YYYY-MM-DD without timezone interference
    const formattedDate = [
      newDate.getFullYear(),
      String(newDate.getMonth() + 1).padStart(2, "0"),
      String(newDate.getDate()).padStart(2, "0"),
    ].join("-");

    onDateSelect(formattedDate);
    onClose();
  };

  const renderCalendarDays = () => {
    const days: React.JSX.Element[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-3"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      currentDate.setHours(0, 0, 0, 0); // Normalize time to midnight

      const isToday = currentDate.getTime() === today.getTime();
      const isSelected = currentDate.getTime() === selectedDateObj.getTime();
      const isPast = currentDate < today && !isToday;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isPast}
          className={`
            relative p-2 sm:p-3 w-full h-10 sm:h-12 text-xs sm:text-sm font-medium transition-all hover:bg-blue-300 rounded-lg
            ${
              isSelected
                ? "bg-blue-600 text-white shadow-lg"
                : isToday
                ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                : isPast
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:text-blue-600"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };

  // Helper function for display formatting
  const formatDisplayDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-");
    return `${monthNames[parseInt(month) - 1]} ${day}, ${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Select Date
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>

          <h4 className="text-base sm:text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-1 sm:p-2 text-center text-xs sm:text-sm font-semibold text-gray-600 border-b border-gray-200"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 border border-gray-200 rounded-lg p-2 bg-gray-50">
            {renderCalendarDays()}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              onDateSelect(formatDate(today));
              onClose();
            }}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Go to Today
          </button>
          <div className="text-xs text-gray-500">
            Selected: {formatDisplayDate(selectedDate)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactCalendarStyle;
