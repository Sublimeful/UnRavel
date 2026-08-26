export async function register(
  username: string,
  password: string,
): Promise<{ ok: boolean; message: string | null }> {
  try {
    const res = await fetch(
      `/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    if (res.status === 200) {
      return { ok: true, message: null };
    }

    return { ok: false, message: (await res.text()) || "Registration failed" };
  } catch (error) {
    console.error(error);

    return { ok: false, message: "Could not reach the server" };
  }
}

export async function signIn(
  username: string,
  password: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/auth/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    return res.status === 200;
  } catch (error) {
    console.error(error);

    return false;
  }
}

export async function getSession(): Promise<string | null> {
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

export async function signOut(): Promise<boolean> {
  const res = await fetch(
    `/api/auth/signout`,
    {
      method: "POST",
    },
  );

  return res.status === 200;
}