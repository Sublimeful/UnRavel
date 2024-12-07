import { db } from "../firebase.ts";
import { FieldPath, Filter } from "firebase-admin/firestore";

export async function getUserELO(uid: string): Promise<number | null> {
  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();

    const userELO = userDoc.exists && userDoc.get("elo")
      ? userDoc.get("elo")
      : 0;

    return userELO;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getUsername(uid: string): Promise<string | null> {
  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();

    const username = userDoc.exists && userDoc.get("username")
      ? userDoc.get("username")
      : null;

    return username;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function setUsername(uid: string, username: string) {
  const userRef = db.collection("users").doc(uid);

  try {
    await userRef.set({ username }, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

export async function changeUserELO(uid: string, deltaELO: number) {
  const userRef = db.collection("users").doc(uid);

  try {
    const userELO = await getUserELO(uid);

    if (userELO === null) return;

    await userRef.set({ elo: userELO + deltaELO }, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

export async function getUserRank(uid: string): Promise<number | null> {
  const usersRef = db.collection("users");

  try {
    const userELO = await getUserELO(uid);
    const rank = (await usersRef.where(
      Filter.and(
        Filter.where("elo", "!=", NaN),
        Filter.or(
          Filter.where("elo", ">", userELO),
          Filter.and(
            Filter.where("elo", "==", userELO),
            Filter.where(FieldPath.documentId(), "<", uid),
          ),
        ),
      ),
    ).count().get()).data().count;
    return rank;
  } catch (err) {
    console.error(err);
    return null;
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
