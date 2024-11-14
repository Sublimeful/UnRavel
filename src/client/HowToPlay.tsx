import { useContext } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";

export default function HowToPlay() {
  const { setPage } = useContext(PageContext);

  return (
    <div className="absolute transition-[width] h-[98%] xl:w-[75%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center p-10 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => setPage(<MainMenu />)}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Back to Menu
        </button>
        <img src="logo.png" className="w-24 aspect-square" />
      </div>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#55CED2] to-[#DB1F3C]">
        How to Play UnRavel
      </h1>
      <div className="shrink-0 flex flex-row w-full min-h-max gap-4 mt-8 overflow-x-scroll overflow-y-clip">
        <div className="bg-[#1A1C38] flex-[1_0_0] flex flex-col items-center min-w-40 gap-1 p-5 rounded-xl">
          <i className="bi bi-people-fill text-6xl text-teal-400"></i>
          <h1 className="text-xl">Join a Game</h1>
          <p className="text-gray-400">
            Create your own room or engage in ELO based random matchmaking with
            other players.
          </p>
        </div>
        <div className="bg-[#1A1C38] flex-[1_0_0] flex flex-col items-center min-w-40 gap-1 p-5 rounded-xl">
          <i className="w-[3.75rem] aspect-square bg-red-400 [mask-size:contain] [mask-image:url(brain.svg)]" />
          <h1 className="text-xl">Get Your Secret Term</h1>
          <p className="text-gray-400">
            An AI will choose a random term from a selected category.
          </p>
        </div>
        <div className="bg-[#1A1C38] flex-[1_0_0] flex flex-col items-center min-w-40 gap-1 p-5 rounded-xl">
          <i className="bi bi-chat text-6xl text-yellow-400"></i>
          <h1 className="text-xl">Ask Questions</h1>
          <p className="text-gray-400">
            Ask questions to gather information about the secret term.
          </p>
        </div>
        <div className="bg-[#1A1C38] flex-[1_0_0] flex flex-col items-center min-w-40 gap-1 p-5 rounded-xl">
          <i className="bi bi-stars text-6xl text-purple-500"></i>
          <h1 className="text-xl">Make Your Guess</h1>
          <p className="text-gray-400">
            Use the information you've gathered to try and guess the secret
            term.
          </p>
        </div>
        <div className="bg-[#1A1C38] flex-[1_0_0] flex flex-col items-center min-w-40 gap-1 p-5 rounded-xl">
          <i className="bi bi-trophy text-6xl text-lime-500"></i>
          <h1 className="text-xl">Win the Game</h1>
          <p className="text-gray-400">
            The first player to correctly guess the secret term wins!
          </p>
        </div>
      </div>
      <div className="mt-8 self-start">
        <h1 className="text-xl font-bold">Tips for Success</h1>
        <div className="list-disc text-gray-400">
          <li>Ask strategic questions to narrow down possibilities quickly.</li>
          <li>
            Pay close attention to the AI's answers and ensure that your
            questions are close-ended.
          </li>
          <li>
            Don't be afraid to make a guess if you think you know the answer!
          </li>
          <li>
            Use process of elimination to rule out terms.
          </li>
          <li>
            Start with broad questions and get more specific as you gather
            information.
          </li>
        </div>
      </div>
    </div>
  );
}
