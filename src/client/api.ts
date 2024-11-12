import type { GameSettings, PlayerStatsSanitized } from "../types";
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
  settings: GameSettings,
): Promise<boolean> {
  const res = await fetch(
    `/${roomCode}/start-game`,
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

export async function gameGetCategory(
  sid: SID,
  roomCode: RoomCode,
): Promise<string | null> {
  const res = await fetch(
    `/${roomCode}/game/category`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { category } = await res.json();

    return category;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function gameAsk(
  sid: SID,
  roomCode: RoomCode,
  question: string,
): Promise<string | null> {
  const res = await fetch(
    `/${roomCode}/game/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `SID ${sid}`,
      },
      body: JSON.stringify({ question }),
    },
  );

  if (res.status === 200) {
    const { answer } = await res.json();

    return answer;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function gameGuess(
  sid: SID,
  roomCode: RoomCode,
  guess: string,
): Promise<number | null> {
  const res = await fetch(
    `/${roomCode}/game/guess`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `SID ${sid}`,
      },
      body: JSON.stringify({ guess }),
    },
  );

  if (res.status === 200) {
    const { proximity } = await res.json() as { proximity: number };

    return proximity;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function gameGetWinner(
  sid: SID,
  roomCode: RoomCode,
): Promise<PlayerSanitized | null> {
  const res = await fetch(
    `/${roomCode}/game/winner`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { winner } = await res.json() as { winner: PlayerSanitized };

    return winner;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function gameGetSecretPhrase(
  sid: SID,
  roomCode: RoomCode,
): Promise<string | null> {
  const res = await fetch(
    `/${roomCode}/game/secret-phrase`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { secretPhrase } = await res.json() as { secretPhrase: string };

    return secretPhrase;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function gameGetPlayerStats(
  sid: SID,
  roomCode: RoomCode,
): Promise<Record<PlayerID, PlayerStatsSanitized> | null> {
  const res = await fetch(
    `/${roomCode}/game/player-stats`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { playerStats } = await res.json() as {
      playerStats: Record<PlayerID, PlayerStatsSanitized>;
    };

    return playerStats;
  } else {
    console.error(await res.text());

    return null;
  }
}
