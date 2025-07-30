import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CalendarDays,
  Users,
  UserCheck,
  CalendarCheck,
  Menu,
} from "lucide-react";
import type { Client, Booking } from "../../types";
import {
  generateTimeSlots,
  formatTime,
  getCurrentTimePosition,
} from "../../utils/timeUtils";
import { formatDate, formatDisplayDate } from "../../utils/dateUtils";
import { getRecurringBookings, hasConflict } from "../../utils/conflictChecker";
import { useBookings } from "../../hooks/useBookings";
import ReactCalendarStyle from "./Calender";

const HealthTickCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDate(new Date())
  );
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [callType, setCallType] = useState<"onboarding" | "follow-up">(
    "follow-up"
  );
  const [currentTime, setCurrentTime] = useState(getCurrentTimePosition());
  const [showMobileStats, setShowMobileStats] = useState(false);
  // Firebase hooks
  const { bookings, clients, loading, error, addBooking, removeBooking } =
    useBookings();

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(getCurrentTimePosition());
    };

    // Update immediately
    updateCurrentTime();

    // Then update every minute
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const timeSlots = generateTimeSlots();

  // Get all bookings for the selected date (including recurring)
  const getDayBookings = (date: string) => {
    const directBookings = bookings.filter((booking) => booking.date === date);

    // Get recurring instances for this date
    const recurringBookings = getRecurringBookings(bookings, date);

    // Combine them, ensuring we don't double-count
    return [...directBookings, ...recurringBookings].filter(
      (booking, index, self) =>
        // Remove duplicates where a booking appears in both arrays
        index ===
        self.findIndex(
          (b) =>
            // For recurring instances, compare by original ID
            (b.id.includes("-") ? b.id.split("-")[0] : b.id) ===
            (booking.id.includes("-") ? booking.id.split("-")[0] : booking.id)
        )
    );
  };

  const dayBookings = getDayBookings(selectedDate);

  const bookingStats = {
    total: dayBookings.length,
    onboarding: dayBookings.filter(
      (booking) =>
        booking.callType === "onboarding" && !booking.id.includes("-")
    ).length,
    followUp: dayBookings.filter(
      (booking) => booking.callType === "follow-up" && !booking.id.includes("-")
    ).length,
  };

  // Filter clients based on search
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  const isTimeSlotInPast = (timeSlot: string) => {
    if (!isViewingToday) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [slotHour, slotMinute] = timeSlot.split(":").map(Number);

    return (
      slotHour < currentHour ||
      (slotHour === currentHour && slotMinute < currentMinute)
    );
  };
  const handleBooking = async () => {
    if (!selectedClient || !selectedTimeSlot) return;

    const duration = callType === "onboarding" ? 40 : 20;
    if (hasConflict(selectedTimeSlot, duration, dayBookings)) {
      alert("This time slot conflicts with an existing booking!");
      return;
    }

    // Prepare booking data - only include originalDate for follow-up calls
    const newBookingData: Omit<Booking, "id"> = {
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      callType,
      date: selectedDate,
      time: selectedTimeSlot,
      isRecurring: callType === "follow-up",
    };

    // Only add originalDate for follow-up calls
    if (callType === "follow-up") {
      newBookingData.originalDate = selectedDate;
    }

    try {
      await addBooking(newBookingData);
      setShowBookingModal(false);
      setSelectedTimeSlot("");
      setSelectedClient(null);
      setSearchTerm("");
      setCallType("follow-up"); // Reset to default
    } catch (error) {
      // Error is handled in the hook
      console.error("Failed to book appointment");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (bookingId.includes("-")) {
      // This is a recurring booking occurrence
      const originalId = bookingId.split("-")[0];
      try {
        await removeBooking(originalId);
      } catch (error) {
        console.error("Failed to delete booking");
      }
    } else {
      try {
        await removeBooking(bookingId);
      } catch (error) {
        console.error("Failed to delete booking");
      }
    }
  };

  const openBookingModal = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowBookingModal(true);
    setSelectedClient(null);
    setSearchTerm("");
    setCallType("follow-up");
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedTimeSlot("");
    setSelectedClient(null);
    setSearchTerm("");
    setCallType("follow-up");
  };

  const navigateDate = (direction: "prev" | "next") => {
    // Parse the current date correctly (YYYY-MM-DD format)
    const [year, month, day] = selectedDate.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day); // month is 0-indexed

    // Create new date without timezone issues
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));

    // Format the new date correctly
    const formattedDate = [
      newDate.getFullYear(),
      String(newDate.getMonth() + 1).padStart(2, "0"),
      String(newDate.getDate()).padStart(2, "0"),
    ].join("-");

    setSelectedDate(formattedDate);
  };

  const isViewingToday = selectedDate === formatDate(new Date());

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Loading Calendar...
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Setting up your appointments
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-xl">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                  HealthTick
                </h1>
                <p className="text-xs sm:text-base text-gray-600 mt-1 hidden sm:block">
                  Manage coaching calls efficiently
                </p>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <CalendarCheck className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {bookingStats.total}
                </span>
                <span className="text-xs text-gray-600">Total</span>
              </div>

              <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  {bookingStats.onboarding}
                </span>
                <span className="text-xs text-blue-700">Onboarding</span>
              </div>

              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">
                  {bookingStats.followUp}
                </span>
                <span className="text-xs text-green-700">Follow-up</span>
              </div>
            </div>

            {/* Mobile Stats Button */}
            <button
              onClick={() => setShowMobileStats(!showMobileStats)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile Stats Dropdown */}
          {showMobileStats && (
            <div className="mt-4 md:hidden grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-gray-100 px-2 py-3 rounded-lg">
                <CalendarCheck className="w-4 h-4 text-gray-600 mb-1" />
                <span className="text-sm font-semibold text-gray-900">
                  {bookingStats.total}
                </span>
                <span className="text-xs text-gray-600">Total</span>
              </div>

              <div className="flex flex-col items-center bg-blue-100 px-2 py-3 rounded-lg">
                <UserCheck className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-sm font-semibold text-blue-900">
                  {bookingStats.onboarding}
                </span>
                <span className="text-xs text-blue-700">Onboarding</span>
              </div>

              <div className="flex flex-col items-center bg-green-100 px-2 py-3 rounded-lg">
                <Users className="w-4 h-4 text-green-600 mb-1" />
                <span className="text-sm font-semibold text-green-900">
                  {bookingStats.followUp}
                </span>
                <span className="text-xs text-green-700">Follow-up</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center">
            <button
              onClick={() => navigateDate("prev")}
              className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-50 hover:bg-gray-100 transition-colors border-r border-gray-200 group"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>

            <button
              onClick={() => setShowCalendarPicker(true)}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-center hover:bg-gray-50 transition-colors group"
            >
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                {formatDisplayDate(selectedDate)}
              </h2>
              {isViewingToday && currentTime && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    Current: {currentTime.displayTime}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-500 font-medium">
                  Tap to open calendar
                </span>
              </div>
            </button>

            <button
              onClick={() => navigateDate("next")}
              className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-50 hover:bg-gray-100 transition-colors border-l border-gray-200 group"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative">
            {isViewingToday && currentTime && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${currentTime.percentage}%` }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-white shadow-lg ml-1 sm:ml-2 relative z-20"></div>
                  <div className="flex-1 h-0.5 bg-red-500 shadow-sm relative z-10"></div>
                  <div className="bg-red-500 text-white text-xs px-1 sm:px-2 py-1 rounded-md mr-1 sm:mr-2 font-medium shadow-lg relative z-20">
                    {currentTime.displayTime}
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {timeSlots.map((timeSlot) => {
                const booking = dayBookings.find((b) => b.time === timeSlot);
                const isBooked = !!booking;
                const callDuration = callType === "onboarding" ? 40 : 20;
                const wouldConflict = hasConflict(
                  timeSlot,
                  callDuration,
                  dayBookings
                );
                const isPastTimeSlot =
                  isViewingToday && isTimeSlotInPast(timeSlot);

                return (
                  <div
                    key={timeSlot}
                    className="flex flex-col sm:flex-row sm:items-center hover:bg-gray-50 transition-colors"
                  >
                    {/* Time Column */}
                    <div className="w-full sm:w-32 px-4 sm:px-6 py-3 sm:py-4 sm:border-r border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-sm sm:text-base font-medium text-gray-900">
                          {formatTime(timeSlot)}
                        </span>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 px-4 sm:px-6 py-3 sm:py-4">
                      {isBooked ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                            <div
                              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${
                                booking.callType === "onboarding"
                                  ? isPastTimeSlot
                                    ? "bg-blue-300"
                                    : "bg-blue-500"
                                  : isPastTimeSlot
                                  ? "bg-green-300"
                                  : "bg-green-500"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <User
                                  className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                    isPastTimeSlot
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm sm:text-base font-semibold truncate ${
                                    isPastTimeSlot
                                      ? "text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {booking.clientName}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className={`self-start sm:self-center p-2 rounded-lg transition-colors ${
                              isPastTimeSlot
                                ? "text-red-300 hover:bg-red-25"
                                : "text-red-500 hover:bg-red-50"
                            }`}
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openBookingModal(timeSlot)}
                          disabled={wouldConflict || isPastTimeSlot}
                          className={`w-full flex items-center justify-center space-x-2 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 border-dashed transition-all text-sm sm:text-base ${
                            wouldConflict || isPastTimeSlot
                              ? "border-red-200 text-red-400 cursor-not-allowed"
                              : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {wouldConflict
                              ? "Conflicts with existing booking"
                              : isPastTimeSlot
                              ? "Past time slot"
                              : "Book appointment"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showCalendarPicker && (
        <ReactCalendarStyle
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onClose={() => setShowCalendarPicker(false)}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Book Appointment
              </h3>
              <button
                onClick={closeBookingModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Time Display */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-semibold text-blue-900">
                    {formatTime(selectedTimeSlot)} on{" "}
                    {formatDisplayDate(selectedDate)}
                  </span>
                </div>
              </div>

              {/* Call Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Call Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setCallType("onboarding")}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      callType === "onboarding"
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-medium">Onboarding</div>
                    <div className="text-xs text-gray-500">40 minutes</div>
                  </button>
                  <button
                    onClick={() => setCallType("follow-up")}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      callType === "follow-up"
                        ? "border-green-500 bg-green-50 text-green-900"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-medium">Follow-up</div>
                    <div className="text-xs text-gray-500">20 min • Weekly</div>
                  </button>
                </div>
              </div>

              {/* Client Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search client name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {searchTerm && (
                  <div className="mt-2 max-h-32 sm:max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setSearchTerm(client.name);
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {client.name}
                        </div>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 mt-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedClient && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium text-green-900 truncate">
                        {selectedClient.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-green-700 mt-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{selectedClient.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedClient}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all text-sm sm:text-base"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTickCalendar;
