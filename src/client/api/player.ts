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
