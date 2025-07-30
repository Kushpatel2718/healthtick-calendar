import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe5HKvv1HYnq_MVewHNXSZV7dAu5yJ6XI",
  authDomain: "healthtick-calendar-945db.firebaseapp.com",
  projectId: "healthtick-calendar-945db",
  storageBucket: "healthtick-calendar-945db.firebasestorage.app",
  messagingSenderId: "954315759950",
  appId: "1:954315759950:web:d3e49ed1eb9480a3befe1f",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
