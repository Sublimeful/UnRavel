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
    const csrfToken = crypto.randomUUID();

    // Set csrfToken expiration to 1 day
    const expiresIn = 60 * 60 * 24;
    const cookie = new Cookies(null, { path: "/" });
    cookie.set("csrfToken", csrfToken, {
      maxAge: expiresIn,
      secure: true,
    });

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

export async function getSession() {
  const res = await fetch(
    `/api/auth/session`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { uid } = await res.json() as { uid: string };

    return uid;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function signout() {
  const res = await fetch(
    `/api/auth/signout`,
    {
      method: "POST",
    },
  );

  return res.status === 200;
}
