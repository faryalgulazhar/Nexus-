import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// You can either replace these process.env variables with your hardcoded 
// config values, or preferably create a .env.local file with these keys!
const firebaseConfig = {
  apiKey: "AIzaSyA4E_J1ski_0M8mw8YAt9IBPvDuOqH6Y6c",
  authDomain: "school-planner-bdac5.firebaseapp.com",
  projectId: "school-planner-bdac5",
  storageBucket: "school-planner-bdac5.firebasestorage.app",
  messagingSenderId: "577865772066",
  appId: "1:577865772066:web:592c26b4cd47c1e7f76e7b"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
