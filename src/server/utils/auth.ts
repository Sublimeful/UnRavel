import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "../firebase";

export async function verifySessionCookie(
  sessionCookie: string,
): Promise<DecodedIdToken | null> {
  try {
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    return null;
  }
}
