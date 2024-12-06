export async function getRankings(): Promise<
  {
    uid: string;
    username?: string;
    elo?: number;
  }[] | null
> {
  const res = await fetch(
    `/api/rankings`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const rankings = await res.json();

    return rankings;
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function getRank(): Promise<number | null> {
  const res = await fetch(
    `/api/rank`,
    {
      method: "GET",
    },
  );

  if (res.status === 200) {
    const { rank } = await res.json();

    return rank;
  } else {
    console.error(await res.text());

    return null;
  }
}
