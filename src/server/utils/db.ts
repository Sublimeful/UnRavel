import { db } from "../firebase.ts";
import { FieldPath, Filter } from "firebase-admin/firestore";

export async function getUserELO(uid: string) {
  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();

    const userELO = userDoc.exists ? userDoc.get("elo") : 0;

    return userELO;
  } catch (err) {
    console.error(err);
    return -1;
  }
}

export async function getUsername(uid: string) {
  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();

    const username = userDoc.exists ? userDoc.get("username") : null;

    return username;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function changeUserELO(uid: string, deltaELO: number) {
  // No point in changing elo by 0
  if (deltaELO === 0) return;

  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();

    const userELO = userDoc.exists ? userDoc.get("elo") : 0;

    if (!userDoc.exists) {
      userRef.set({ elo: deltaELO });
    } else {
      userRef.update("elo", userELO + deltaELO);
    }
  } catch (err) {
    console.error(err);
  }
}

export async function getUserRank(uid: string) {
  const usersRef = db.collection("users");

  try {
    const userELO = await getUserELO(uid);
    const rank = (await usersRef.where(
      Filter.or(
        Filter.where("elo", ">", userELO),
        Filter.and(
          Filter.where("elo", "==", userELO),
          Filter.where(FieldPath.documentId(), "<", uid),
        ),
      ),
    ).count().get()).data().count;
    return rank;
  } catch (err) {
    console.error(err);
    return -1;
  }
}

export async function getRankings(): Promise<{
  uid: string;
  username?: string;
  elo?: number;
}[]> {
  const usersRef = db.collection("users");

  try {
    const top50Doc = await usersRef.orderBy("elo", "desc").orderBy(
      FieldPath.documentId(),
      "asc",
    ).limit(50).get();
    return top50Doc.docs.map((userDoc) => ({
      uid: userDoc.id,
      ...userDoc.data(),
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
