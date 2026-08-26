import type { Interaction, PlayerStatsSanitized } from "../../types";
import type { PlayerSanitized } from "../../types";

export async function gameGetState(
  roomCode: string,
): Promise<"idle" | "in progress" | null> {
  const res = await fetch(
    `/api/${roomCode}/game/state`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { state } = await res.json();

    return state;
  } else {
    console.error(await res.text());

    return null;
  }
}

/**
  Gets the current countdown time
*/
export async function gameGetTimeLeft(
  roomCode: string,
): Promise<number | null> {
  const res = await fetch(
    `/api/${roomCode}/game/time-left`,
    {
      method: "GET",
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
  roomCode: string,
): Promise<string | null> {
  const res = await fetch(
    `/api/${roomCode}/game/category`,
    {
      method: "GET",
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
  roomCode: string,
  question: string,
  onChunk: (chunk: string) => void,
): Promise<string | null> {
  const res = await fetch(
    `/api/${roomCode}/game/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    },
  );

  if (!res.ok || !res.body) {
    console.error(await res.text());

    return null;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    for (const line of buffer.split("\n")) {
      if (line.startsWith("data:")) {
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          return answer;
        }
        try {
          const json = JSON.parse(payload) as {
            chunk?: string;
            error?: string;
          };
          if (json.error) return null;
          if (json.chunk) {
            answer += json.chunk;
            onChunk(json.chunk);
          }
        } catch {
          // ignore keep-alive / partial lines
        }
      }
    }

    buffer = buffer.split("\n").pop() ?? "";
  }

  return answer;
}

export async function gameGuess(
  roomCode: string,
  guess: string,
): Promise<number | null> {
  const res = await fetch(
    `/api/${roomCode}/game/guess`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  roomCode: string,
): Promise<PlayerSanitized | null> {
  const res = await fetch(
    `/api/${roomCode}/game/winner`,
    {
      method: "GET",
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
  roomCode: string,
): Promise<string | null> {
  const res = await fetch(
    `/api/${roomCode}/game/secret-term`,
    {
      method: "GET",
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

export async function gameGetInteractions(
  roomCode: string,
): Promise<Interaction[] | null> {
  const res = await fetch(
    `/api/${roomCode}/game/interactions`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { interactions } = await res.json() as {
      interactions: Interaction[];
    };

    return interactions;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function gameGetPlayerStats(
  roomCode: string,
): Promise<Record<string, PlayerStatsSanitized> | null> {
  const res = await fetch(
    `/api/${roomCode}/game/player-stats`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { playerStats } = await res.json() as {
      playerStats: Record<string, PlayerStatsSanitized>;
    };

    return playerStats;
  } else {
    console.error(await res.text());

    return null;
  }
}
