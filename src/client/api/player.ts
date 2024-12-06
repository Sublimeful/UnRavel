import type { PlayerSanitized } from "../../types";

export async function playerSignIn(
  username: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/player-sign-in`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    },
  );

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}

export async function getPlayer(): Promise<PlayerSanitized | null> {
  const res = await fetch(
    `/api/player`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const player = await res.json();

    return player;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function getUsername(): Promise<string | null> {
  const res = await fetch(
    `/api/username`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { username } = await res.json();

    return username;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function getUserELO(): Promise<number | null> {
  const res = await fetch(
    `/api/elo`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { elo } = await res.json();

    return elo;
  } else {
    console.error(await res.text());

    return null;
  }
}
