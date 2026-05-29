import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQ80hunEnAuwhnstIZrxxolEGxgOOJuhs",
  authDomain: "mediscan-7d2fa.firebaseapp.com",
  projectId: "mediscan-7d2fa",
  storageBucket: "mediscan-7d2fa.firebasestorage.app",
  messagingSenderId: "92262730747",
  appId: "1:92262730747:web:d547f790aa49edc9e9d95e",
  measurementId: "G-6E0YDDZS8J"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
