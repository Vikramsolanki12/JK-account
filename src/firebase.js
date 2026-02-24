// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBH7Uw7lWvM8zS64_ByMiADnitezjqsUZ4",
  authDomain: "jk-count.firebaseapp.com",
  projectId: "jk-count",
  storageBucket: "jk-count.firebasestorage.app",
  messagingSenderId: "344401323754",
  appId: "1:344401323754:web:ed0ac5d4d6d3ad866b1993"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);   // ✅ ADD THIS
export const provider = new GoogleAuthProvider();  // ✅ ADD THIS