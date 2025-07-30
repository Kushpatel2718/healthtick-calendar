import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Booking, Client } from "../types";

// Collections
const BOOKINGS_COLLECTION = "bookings";
const CLIENTS_COLLECTION = "clients";

// Booking Operations
export const createBooking = async (
  booking: Omit<Booking, "id">
): Promise<string> => {
  try {
    // Clean the booking data to remove undefined values
    const cleanBookingData: any = {
      clientId: booking.clientId,
      clientName: booking.clientName,
      callType: booking.callType,
      date: booking.date,
      time: booking.time,
      isRecurring: booking.isRecurring,
      createdAt: Timestamp.now(),
    };

    // Only add originalDate if it's not undefined
    if (booking.originalDate !== undefined) {
      cleanBookingData.originalDate = booking.originalDate;
    }

    const docRef = await addDoc(
      collection(db, BOOKINGS_COLLECTION),
      cleanBookingData
    );
    return docRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, BOOKINGS_COLLECTION), orderBy("date", "asc"))
    );

    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
};

export const getBookingsByDate = async (date: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("date", "==", date),
      orderBy("time", "asc")
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    throw new Error("Failed to fetch bookings for the selected date");
  }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw new Error("Failed to delete booking");
  }
};

// Client Operations
export const createClient = async (
  client: Omit<Client, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
      ...client,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating client:", error);
    throw new Error("Failed to create client");
  }
};

export const getAllClients = async (): Promise<Client[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, CLIENTS_COLLECTION), orderBy("name", "asc"))
    );

    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push({
        id: doc.id,
        ...doc.data(),
      } as Client);
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
};

// Check if a client with the same name and phone already exists
export const checkClientExists = async (
  name: string,
  phone: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where("name", "==", name),
      where("phone", "==", phone)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking client existence:", error);
    return false;
  }
};

// Initialize dummy clients (run this once)
export const initializeDummyClients = async (): Promise<void> => {
  const dummyClients = [
    { name: "Sriram Kumar", phone: "9876543210" },
    { name: "Shilpa Sharma", phone: "8765432109" },
    { name: "Rahul Mehta", phone: "7654321098" },
    { name: "Priya Patel", phone: "6543210987" },
    { name: "Arjun Singh", phone: "5432109876" },
    { name: "Kavya Reddy", phone: "4321098765" },
    { name: "Vikram Joshi", phone: "3210987654" },
    { name: "Ananya Gupta", phone: "2109876543" },
    { name: "Rohan Das", phone: "1098765432" },
    { name: "Meera Iyer", phone: "0987654321" },
    { name: "Karthik Nair", phone: "9876543211" },
    { name: "Deepika Roy", phone: "8765432110" },
    { name: "Sameer Khan", phone: "7654321099" },
    { name: "Ritika Agarwal", phone: "6543210988" },
    { name: "Ashwin Pillai", phone: "5432109877" },
    { name: "Neha Bansal", phone: "4321098766" },
    { name: "Gaurav Malhotra", phone: "3210987655" },
    { name: "Swati Verma", phone: "2109876544" },
    { name: "Nikhil Chopra", phone: "1098765433" },
    { name: "Pooja Saxena", phone: "0987654322" },
  ];

  try {
    console.log("Checking for existing clients...");

    // Check if any of the dummy clients already exist
    let hasAnyClient = false;
    for (const client of dummyClients.slice(0, 3)) {
      // Check first 3 clients
      const exists = await checkClientExists(client.name, client.phone);
      if (exists) {
        hasAnyClient = true;
        break;
      }
    }

    if (hasAnyClient) {
      console.log("Dummy clients already initialized");
      return;
    }

    console.log("Initializing dummy clients...");

    // Add all dummy clients one by one to avoid duplicates
    for (const client of dummyClients) {
      const exists = await checkClientExists(client.name, client.phone);
      if (!exists) {
        await createClient(client);
      }
    }

    console.log("Dummy clients initialized successfully");
  } catch (error) {
    console.error("Error initializing dummy clients:", error);
  }
};
