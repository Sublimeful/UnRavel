import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMjD4wCaz0REdhquMLrJn-N1UcrlPIR-I",
  authDomain: "unravel-23a19.firebaseapp.com",
  projectId: "unravel-23a19",
  storageBucket: "unravel-23a19.firebasestorage.app",
  messagingSenderId: "678401170876",
  appId: "1:678401170876:web:84b66e22f4cfc42c16dfb9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
