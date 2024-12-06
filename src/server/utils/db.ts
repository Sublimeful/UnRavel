import { db } from "../firebase.ts";

export async function getUserELO(uid: string) {
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  const userELO = userDoc.exists ? userDoc.get("elo") : 0;

  return userELO;
}

export async function changeUserELO(uid: string, deltaELO: number) {
  // No point in changing elo by 0
  if (deltaELO === 0) return;

  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  const userELO = userDoc.exists ? userDoc.get("elo") : 0;

  if (!userDoc.exists) {
    userRef.set({ elo: deltaELO });
  } else {
    userRef.update("elo", userELO + deltaELO);
  }
}
