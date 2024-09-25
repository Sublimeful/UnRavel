export default function MainMenu() {
  return (
    <div className="absolute h-5/6 w-3/4 max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center justify-center text-white">
      <img src="logo.png" className="w-40 aspect-square" />
      <h1 className="text-[#DB1F3C] text-5xl font-bold">UnRavel</h1>
      <h2 className="text-3xl font-light">The Ultimate Guessing Game</h2>
      <button className="w-3/4 h-16 mt-10 rounded text-2xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#003089] flex items-center justify-center gap-2">
        Join a Random Room
        <i className="bi bi-shuffle"></i>
      </button>
      <div className="w-3/4 mt-6 flex flex-row gap-2">
        <button className="w-1/2 h-16 rounded text-lg font-light bg-[#595858] flex items-center justify-center gap-2">
          Create a Room
          <i className="bi bi-plus-square"></i>
        </button>
        <button className="w-1/2 h-16 rounded text-lg font-light bg-[#595858] flex items-center justify-center gap-2">
          Join a Room
          <i className="bi bi-people-fill"></i>
        </button>
      </div>
      <button className="w-3/4 h-16 mt-6 rounded text-2xl font-light bg-[#595858] flex items-center justify-center gap-2">
        How to Play
        <i className="bi bi-question-circle"></i>
      </button>
    </div>
  );
}
