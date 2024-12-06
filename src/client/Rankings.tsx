import { useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import { getRank, getRankings } from "./api/rankings";
import { getUserELO, getUsername } from "./api/player";

export default function Rankings() {
  const { setPage } = useContext(PageContext);
  const [rankings, setRankings] = useState<{
    uid: string;
    username?: string;
    elo?: number;
  }[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userELO, setUserELO] = useState<number | null>(null);

  useEffect(() => {
    getRankings().then((_rankings) => {
      if (_rankings) setRankings(_rankings);
    });
    getRank().then(setRank);
    getUsername().then(setUsername);
    getUserELO().then(setUserELO);
  }, []);

  return (
    <div className="absolute transition-[height,width] h-[98%] w-[98%] max-w-3xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <ol
        className="min-h-40 w-full flex flex-col gap-2 overflow-y-scroll"
        style={{ "flex": "12 0 0" }}
      >
        {Object.entries(rankings).sort().map((
          [uid, { username, elo }],
          _rank,
        ) => (
          <li
            key={uid}
            className="flex flex-row items-center gap-6 justify-between w-full bg-[#595959] bg-opacity-60 rounded-lg px-3 py-2"
          >
            <span className="flex-[1_0_0] text-nowrap break-all truncate">
              #{_rank + 1}
            </span>
            <span
              className="text-nowrap break-all truncate"
              style={{ "flex": "10 0 0" }}
            >
              {username ?? uid}
            </span>
            <span className="max-w-16 text-white font-semibold text-xl text-nowrap break-all truncate">
              {elo ?? 0}
            </span>
          </li>
        ))}
      </ol>
      <div
        className="flex-[1_0_0] flex flex-row items-center gap-6 justify-between w-full rounded-lg px-5 py-2 text-xl"
        style={{ "backgroundColor": "rgba(255, 215, 0, 0.8)" }}
      >
        <span className="flex-[1_0_0] text-nowrap break-all truncate">
          #{rank !== null ? rank + 1 : "?"}
        </span>
        <span
          className="text-nowrap break-all truncate"
          style={{ "flex": "10 0 0" }}
        >
          {username ? username + " (You)" : "You"}
        </span>
        <span className="max-w-16 text-white font-semibold text-nowrap break-all truncate">
          {userELO ?? 0}
        </span>
      </div>
      <button
        onClick={() => setPage(<MainMenu />)}
        className="flex-[1_0_0] mt-3 min-h-10 bg-[#333333] bg-opacity-80 rounded-lg flex justify-center items-center gap-2"
      >
        Main Menu<i className="bi bi-house-door"></i>
      </button>
    </div>
  );
}
