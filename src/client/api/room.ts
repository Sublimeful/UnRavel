import type { GameSettings } from "../../types";
import type { PlayerSanitized } from "../../types";

export async function roomGet(): Promise<string | null> {
  const res = await fetch(
    `/api/room-get`,
    {
      method: "GET",
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

export async function roomRequest(sid: string): Promise<string | null> {
  const res = await fetch(
    `/api/room-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sid),
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
  sid: string,
  roomCode: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/${roomCode}/join`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sid),
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
  sid: string,
  roomCode: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/${roomCode}/leave`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sid),
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
  roomCode: string,
): Promise<PlayerSanitized[] | null> {
  const res = await fetch(
    `/api/${roomCode}/players`,
    {
      method: "GET",
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
  roomCode: string,
): Promise<string | null> {
  const res = await fetch(
    `/api/${roomCode}/host`,
    {
      method: "GET",
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
  roomCode: string,
  settings: GameSettings,
): Promise<boolean> {
  const res = await fetch(
    `/api/${roomCode}/start-game`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
