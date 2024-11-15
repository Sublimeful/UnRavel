import type { GameSettings } from "../../types";
import type { PlayerID, PlayerSanitized, RoomCode, SID } from "../../types";

export async function roomRequest(sid: SID): Promise<RoomCode | null> {
  const res = await fetch(
    `/api/room-request`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

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
    `/api/${roomCode}/join`,
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
    `/api/${roomCode}/leave`,
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

export async function roomGetPlayers(
  sid: SID,
  roomCode: RoomCode,
): Promise<PlayerSanitized[] | null> {
  const res = await fetch(
    `/api/${roomCode}/players`,
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

export async function roomGetHost(
  sid: SID,
  roomCode: RoomCode,
): Promise<PlayerID | null> {
  const res = await fetch(
    `/api/${roomCode}/host`,
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
  settings: GameSettings,
): Promise<boolean> {
  const res = await fetch(
    `/api/${roomCode}/start-game`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `SID ${sid}`,
      },
      body: JSON.stringify(settings),
    },
  );

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}
