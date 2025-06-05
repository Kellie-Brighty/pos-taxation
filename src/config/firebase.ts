import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize storage
const storage = getStorage(app);

// Add offline persistence support
// This reduces the chance of Firestore internal errors during page transitions
try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn("Firebase persistence unavailable - multiple tabs open");
    } else if (err.code === "unimplemented") {
      // The current browser does not support persistence
      console.warn("Firebase persistence not supported in this browser");
    }
  });
} catch (err) {
  console.warn("Error setting up Firebase persistence:", err);
}

// Handle online/offline state
window.addEventListener("online", () => {
  console.log("App is online, reconnecting to Firestore");
  enableNetwork(db).catch((err) => {
    console.error("Error re-enabling Firestore network:", err);
  });
});

window.addEventListener("offline", () => {
  console.log("App is offline, disabling Firestore network access");
  disableNetwork(db).catch((err) => {
    console.error("Error disabling Firestore network:", err);
  });
});

export { app, auth, db, storage };
