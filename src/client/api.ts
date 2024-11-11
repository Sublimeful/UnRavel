import type { PlayerSanitized, RoomCode, SID } from "../types";

export async function roomRequest(sid: SID): Promise<RoomCode | null> {
  const res = await fetch("/room-request", {
    method: "GET",
    headers: {
      "Authorization": `SID ${sid}`,
    },
  });

  if (res.status === 200) {
    const { roomCode } = await res.json();

    return roomCode;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function roomJoin(
  sid: SID,
  roomCode: RoomCode,
): Promise<boolean> {
  const res = await fetch(
    `/${roomCode}/join`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}

export async function roomLeave(
  sid: SID,
  roomCode: RoomCode,
): Promise<boolean> {
  const res = await fetch(
    `/${roomCode}/leave`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}

export async function playerSignIn(
  sid: SID,
  username: string,
): Promise<boolean> {
  const res = await fetch("/player-sign-in", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `SID ${sid}`,
    },
    body: JSON.stringify({
      username,
    }),
  });

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}

export async function roomGetPlayers(
  sid: SID,
  roomCode: RoomCode,
): Promise<PlayerSanitized[] | null> {
  const res = await fetch(
    `/${roomCode}/players`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const players: PlayerSanitized[] = await res.json();

    return players;
  } else {
    console.error(await res.text());

    return null;
  }
}
