import type { PlayerSanitized, SID } from "../../types";

export async function playerSignIn(
  sid: SID,
  username: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/player-sign-in`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `SID ${sid}`,
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

export async function getPlayer(
  sid: SID,
): Promise<PlayerSanitized | null> {
  const res = await fetch(
    `/api/player`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
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
