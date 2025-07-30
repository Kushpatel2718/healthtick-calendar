import { useState, useEffect, useRef } from "react";
//import { Booking, Client } from '../types';
import {
  getAllBookings,
  createBooking,
  deleteBooking as deleteBookingFromDB,
  getAllClients,
  initializeDummyClients,
} from "../firebase/bookingService";

interface Client {
  id: string;
  name: string;
  phone: string;
}

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

interface UseBookingsReturn {
  bookings: Booking[];
  clients: Client[];
  loading: boolean;
  error: string | null;
  addBooking: (booking: Omit<Booking, "id">) => Promise<void>;
  removeBooking: (bookingId: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
}

export const useBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent multiple initializations
  const isInitialized = useRef(false);

  const fetchBookings = async () => {
    try {
      setError(null);
      const fetchedBookings = await getAllBookings();
      setBookings(fetchedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchClients = async () => {
    try {
      setError(null);
      const fetchedClients = await getAllClients();
      setClients(fetchedClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
      console.error("Error fetching clients:", err);
    }
  };

  const initializeData = async () => {
    if (isInitialized.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      isInitialized.current = true;

      // Initialize dummy clients if needed (this will check for duplicates)
      await initializeDummyClients();

      // Fetch both bookings and clients
      await Promise.all([fetchBookings(), fetchClients()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize data"
      );
      console.error("Error initializing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, "id">) => {
    try {
      setError(null);

      // Clean the booking data before sending to Firebase
      const cleanBookingData: Omit<Booking, "id"> = {
        clientId: bookingData.clientId,
        clientName: bookingData.clientName,
        callType: bookingData.callType,
        date: bookingData.date,
        time: bookingData.time,
        isRecurring: bookingData.isRecurring,
      };

      // Only include originalDate if it's not undefined
      if (bookingData.originalDate !== undefined) {
        cleanBookingData.originalDate = bookingData.originalDate;
      }

      const newBookingId = await createBooking(cleanBookingData);

      // Add the new booking to local state
      const newBooking: Booking = {
        ...cleanBookingData,
        id: newBookingId,
      };

      setBookings((prev) => [...prev, newBooking]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      console.error("Error creating booking:", err);
      throw err;
    }
  };

  const removeBooking = async (bookingId: string) => {
    try {
      setError(null);
      await deleteBookingFromDB(bookingId);

      // Remove from local state
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete booking");
      console.error("Error deleting booking:", err);
      throw err;
    }
  };

  const refreshBookings = async () => {
    await fetchBookings();
  };

  useEffect(() => {
    initializeData();
  }, []);

  return {
    bookings,
    clients,
    loading,
    error,
    addBooking,
    removeBooking,
    refreshBookings,
  };
};

// Separate hook for client operations
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedClients = await getAllClients();
      setClients(fetchedClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    refreshClients: fetchClients,
  };
};
