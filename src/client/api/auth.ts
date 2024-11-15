import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Cookies from "universal-cookie";

export async function register(email: string, password: string) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
}

export async function signin(email: string, password: string) {
  try {
    const user = (await signInWithEmailAndPassword(auth, email, password)).user;
    const idToken = await user.getIdToken();
    const cookie = new Cookies(null, { path: "/" });
    const csrfToken = cookie.get("csrfToken");

    const res = await fetch(
      `/api/auth/signin-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken, csrfToken }),
      },
    );

    // If sign in succeeds, return true, else return false
    return res.status === 200;
  } catch (error) {
    console.error(error);

    return false;
  }
}
