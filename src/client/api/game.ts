import type { PlayerStatsSanitized } from "../../types";
import type { PlayerID, PlayerSanitized, RoomCode, SID } from "../../types";

/**
  Gets the current countdown time
*/
export async function gameGetTimeLeft(
  sid: SID,
  roomCode: RoomCode,
): Promise<number | null> {
  const res = await fetch(
    `/api/${roomCode}/game/time-left`,
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
    `/api/${roomCode}/game/category`,
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
    `/api/${roomCode}/game/ask`,
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
    `/api/${roomCode}/game/guess`,
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
    `/api/${roomCode}/game/winner`,
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

export async function gameGetSecretTerm(
  sid: SID,
  roomCode: RoomCode,
): Promise<string | null> {
  const res = await fetch(
    `/api/${roomCode}/game/secret-term`,
    {
      method: "GET",
      headers: {
        "Authorization": `SID ${sid}`,
      },
    },
  );

  if (res.status === 200) {
    const { secretTerm } = await res.json() as { secretTerm: string };

    return secretTerm;
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
    `/api/${roomCode}/game/player-stats`,
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
