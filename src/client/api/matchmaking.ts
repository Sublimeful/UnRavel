export async function matchmakingQueueEnter(
  sid: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/matchmaking-queue-enter`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sid }),
    },
  );

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}

export async function matchmakingQueueLeave(): Promise<boolean> {
  const res = await fetch(
    `/api/matchmaking-queue-leave`,
    {
      method: "POST",
    },
  );

  if (res.status === 200) {
    return true;
  } else {
    console.error(await res.text());

    return false;
  }
}
