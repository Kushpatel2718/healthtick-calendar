export interface Client {
  id: string;
  name: string;
  phone: string;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  callType: "onboarding" | "follow-up";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isRecurring: boolean;
  originalDate?: string; // For recurring calls, this is the first occurrence
}

export interface ReactCalendarStyleProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}