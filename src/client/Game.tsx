import { type FormEvent, useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import {
  gameAsk as apiGameAsk,
  gameGetCategory,
  gameGetTimeLeft,
  gameGuess as apiGameGuess,
  getPlayer,
  roomGetPlayers,
  roomLeave,
} from "./api";
import { socket } from "./socket";
import type { Interaction, PlayerSanitized, RoomCode } from "../types";
import GameOver from "./GameOver";

interface GameProps {
  roomCode: RoomCode;
}

export default function Game(props: GameProps) {
  const { roomCode } = props;
  const { setPage } = useContext(PageContext);

  const [timeLeft, setTimeLeft] = useState(0);
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [player, setPlayer] = useState<PlayerSanitized | null>(null);
  const [players, setPlayers] = useState<PlayerSanitized[]>([]);
  const [category, setCategory] = useState("");
  const [proximity, setProximity] = useState(0);

  async function gameAsk(event: FormEvent) {
    event.preventDefault();

    if (!socket.id || !question) return;

    // Reset form to prevent spamming questions
    (event.currentTarget as HTMLFormElement).reset();

    const answer = await apiGameAsk(socket.id, roomCode, question);

    if (!answer) return;

    setInteractions([...interactions, { question, answer }]);
  }

  async function gameGuess(event: FormEvent) {
    event.preventDefault();

    if (!socket.id || !guess) return;

    // Reset form to prevent spamming questions
    (event.currentTarget as HTMLFormElement).reset();

    const proximity = await apiGameGuess(socket.id, roomCode, guess);

    if (!proximity) return;

    setProximity(proximity);
  }

  useEffect(() => {
    function syncTimeLeft() {
      if (!socket.id) return;
      gameGetTimeLeft(socket.id, roomCode).then((_timeLeft) => {
        if (!_timeLeft) return;
        setTimeLeft(_timeLeft);
      });
    }

    // Sync time left initially
    syncTimeLeft();

    // Every 5 seconds, sync time left
    const syncTimeLeftInterval = setInterval(syncTimeLeft, 5000);

    return () => clearInterval(syncTimeLeftInterval);
  }, []);

  // Update the timer every second
  useEffect(() => {
    const timerTimeout = setTimeout(() => {
      if (timeLeft >= 1000) {
        setTimeLeft(timeLeft - 1000);
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearTimeout(timerTimeout);
  }, [timeLeft]);

  useEffect(() => {
    if (!socket.id) return;
    gameGetCategory(socket.id, roomCode).then((_category) => {
      if (_category) setCategory(_category);
    });
  }, []);

  useEffect(() => {
    function updatePlayerList() {
      if (!socket.id) return;
      getPlayer(socket.id).then((_player) => {
        if (_player) setPlayer(_player);
      });
      roomGetPlayers(socket.id, roomCode).then((_players) => {
        if (_players) setPlayers(_players);
      });
    }

    function onceGameEnds() {
      // Once the game ends, set the page to game over screen
      setPage(<GameOver roomCode={roomCode} />);
    }

    socket.once("room-game-end", onceGameEnds);
    socket.on("room-player-left", updatePlayerList);

    updatePlayerList(); // Initially update the player list

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("room-game-end", onceGameEnds);
      socket.off("room-player-left", updatePlayerList);
    };
  }, []);

  function timerFormat(timeLeft: number) {
    const secondInMS = 1000;
    const minuteInMS = secondInMS * 60;
    const hourInMS = minuteInMS * 60;
    const HH = Math.floor(timeLeft / hourInMS);
    const MM = Math.floor((timeLeft % hourInMS) / minuteInMS);
    const SS = Math.floor((timeLeft % minuteInMS) / secondInMS);
    if (timeLeft >= 1000 * 60 * 60) {
      return `${HH}:${MM.toString().padStart(2, "0")}:${
        SS.toString().padStart(2, "0")
      }`;
    } else if (timeLeft >= 1000 * 60) {
      return `${MM}:${SS.toString().padStart(2, "0")}`;
    } else {
      return `${SS}`;
    }
  }

  return (
    <div className="absolute transition-[width] h-[98%] xl:w-[75%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center px-8 pt-8 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => {
            if (socket.id) roomLeave(socket.id, roomCode); // Backbutton pressed leaves game/room
            setPage(<MainMenu />);
          }}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Leave Game
        </button>
        <img src="logo.png" className="w-10 aspect-square" />
      </div>
      <div className="flex flex-row gap-2 text-2xl text-[#28dded] font-semibold">
        <i className="bi bi-clock"></i>
        {timerFormat(timeLeft)}
      </div>
      <div className="w-full h-[74vh] min-h-[36rem] pt-5 flex flex-row gap-2">
        <div className="flex-[1_0_0] bg-[#424242] bg-opacity-70 rounded-lg flex flex-col p-4 gap-4 overflow-x-clip overflow-y-scroll">
          <h1 className="text-2xl flex gap-2 font-semibold">
            <i className="bi bi-people-fill"></i>Players
          </h1>
          {players.map((_player) =>
            (player && _player.id === player.id)
              ? (
                <div
                  key={_player.id}
                  className="min-h-12 max-h-12 w-full rounded-lg bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex flex-row items-center px-3"
                >
                  <h1 className="w-full text-xl text-nowrap break-all truncate">
                    {_player.username}
                  </h1>
                </div>
              )
              : (
                <div
                  key={_player.id}
                  className="min-h-12 max-h-12 w-full rounded-lg bg-[#5e5e5e] flex flex-row items-center px-3"
                >
                  <h1 className="w-full text-xl text-nowrap break-all truncate">
                    {_player.username}
                  </h1>
                </div>
              )
          )}
        </div>
        <div className="flex-[3_0_0] min-w-0 flex flex-col gap-3">
          <div className="flex-[2_0_0] bg-[#424242] bg-opacity-70 rounded-lg grid place-items-center text-2xl font-semibold p-5 min-h-0 overflow-y-scroll text-wrap break-all">
            Category: {category}
          </div>
          <div className="flex-[8_0_0] flex flex-col gap-3 overflow-y-scroll bg-[#424242] bg-opacity-70 rounded-lg p-5">
            {interactions.map((interaction, index) => (
              <div key={index}>
                <h1 className="flex gap-2 text-wrap break-all">
                  <span className="font-bold text-nowrap">Player:</span>
                  {interaction.question}
                </h1>
                <h1 className="flex gap-2 text-[#28dded] ml-8 text-wrap break-all">
                  <span className="font-bold text-nowrap">AI:</span>
                  {interaction.answer}
                </h1>
              </div>
            ))}
          </div>
          <form className="flex-[1_0_0] flex flex-row gap-3" onSubmit={gameAsk}>
            <input
              onInput={(event) => setQuestion(event.currentTarget.value)}
              type="text"
              placeholder="Ask a yes/no question..."
              className="flex-[6_0_0] focus:outline-none text-base w-full bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] px-3"
              required
            >
            </input>
            <button
              type="submit"
              className="flex-[1_0_0] mx-auto transition-[font-size] w-full rounded-lg sm:text-base text-black text-sm font-light bg-[#00a0cc] flex items-center justify-center gap-2 disabled:brightness-50"
            >
              Ask
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
          <form
            className="flex-[1_0_0] flex flex-row gap-3"
            onSubmit={gameGuess}
          >
            <input
              onInput={(event) => setGuess(event.currentTarget.value)}
              type="text"
              placeholder="Make a guess..."
              className="flex-[6_0_0] focus:outline-none text-base w-full bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] px-3"
              required
            >
            </input>
            <button
              type="submit"
              className="flex-[1_0_0] mx-auto transition-[font-size] w-full rounded-lg sm:text-base text-sm font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
            >
              Guess
              <i className="w-5 aspect-square bg-white [mask-size:contain] [mask-image:url(brain.svg)]" />
            </button>
          </form>
        </div>
      </div>
      <div className="flex-[1_0_0] shrink-0 w-full flex flex-row py-3 text-3xl justify-between items-center">
        <i className="flex bi bi-snow text-blue-500"></i>
        <div className="w-11/12 h-8 bg-[#343434] rounded-2xl overflow-clip">
          <div
            style={{
              "maskImage": "linear-gradient(90deg, blue, red)",
              "maskSize": `${proximity * 100}%`,
              "maskRepeat": "no-repeat",
            }}
            className="w-full h-8 rounded-2xl transition-all bg-gradient-to-r from-blue-500 to-red-500 duration-1000"
          >
          </div>
        </div>
        <i className="flex bi bi-thermometer text-red-500"></i>
      </div>
    </div>
  );
}
