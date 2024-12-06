import admin from "firebase-admin";
import { initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../serviceAccountKey.json" with { type: "json" };

export const app = initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const auth = getAuth(app);
export const db = getFirestore(app);
