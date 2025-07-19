import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBC-EArNBr7wSgSzJ4CfG9I90DBpeZ5KQ",
  authDomain: "unravel-583a0.firebaseapp.com",
  projectId: "unravel-583a0",
  storageBucket: "unravel-583a0.firebasestorage.app",
  messagingSenderId: "669036715638",
  appId: "1:669036715638:web:30d4f4e2e41496f2338957",
  measurementId: "G-0LN910V0TF",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
