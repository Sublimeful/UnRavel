import type { PlayerID, PlayerSanitized, RoomCode, SID } from "../types";

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

export async function getPlayer(
  sid: SID,
): Promise<PlayerSanitized | null> {
  const res = await fetch(
    `/player`,
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

export async function roomGetHost(
  sid: SID,
  roomCode: RoomCode,
): Promise<PlayerID | null> {
  const res = await fetch(
    `/${roomCode}/host`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { host } = await res.json();

    return host;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function roomStartGame(
  sid: SID,
  roomCode: RoomCode,
): Promise<boolean> {
  const res = await fetch(
    `/${roomCode}/start-game`,
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

/**
  Gets the current countdown time
*/
export async function gameGetTimeLeft(
  sid: SID,
  roomCode: RoomCode,
): Promise<number | null> {
  const res = await fetch(
    `/${roomCode}/game/time-left`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { timeLeft } = await res.json();

    return timeLeft;
  } else {
    console.error(await res.text());

    return null;
  }
}
