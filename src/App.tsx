export default function App() {
  return (
    <div className="h-screen w-screen bg-[#040039] flex items-center justify-center">
      <div className="absolute h-full w-full grid grid-rows-10 grid-cols-10 blur-2xl overflow-clip">
        {/* RED */}
        <div className="row-start-2 col-start-2 row-span-3 col-span-2 bg-[#E24F3B] rounded-full h-full aspect-square place-self-center" />
        {/* CYAN */}
        <div className="row-start-1 col-start-7 row-span-5 col-span-4 bg-[#4DDBDB] rounded-full h-full aspect-square place-self-center" />
        {/* BLUE */}
        <div className="row-start-7 col-start-3 row-span-4 col-span-3 bg-[#4754E5] rounded-full h-full aspect-square place-self-center" />
      </div>
      <div className="absolute h-5/6 w-3/4 max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-white flex flex-col items-center justify-center text-white">
        <img src="/logo.png" className="w-40 aspect-square" />
        <h1 className="text-[#DB1F3C] text-5xl font-bold">UnRavel</h1>
        <h2 className="text-3xl font-light">The Ultimate Guessing Game</h2>
        <button className="w-3/4 h-16 mt-10 rounded text-2xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#003089] flex items-center justify-center gap-2">
          Join a Random Room
          <span className="h-8 aspect-square bg-contain bg-no-repeat bg-[url('/shuffle.svg')]" />
        </button>
        <div className="w-3/4 mt-6 flex flex-row gap-2">
          <button className="w-1/2 h-16 rounded text-lg font-light bg-[#595858] flex items-center justify-center gap-2">
            Create a Room
            <span className="h-5 aspect-square bg-contain bg-no-repeat bg-[url('/plus-square.svg')]" />
          </button>
          <button className="w-1/2 h-16 rounded text-lg font-light bg-[#595858] flex items-center justify-center gap-2">
            Join a Room
            <span className="h-5 aspect-square bg-contain bg-no-repeat bg-[url('/people-fill.svg')]" />
          </button>
        </div>
        <button className="w-3/4 h-16 mt-6 rounded text-2xl font-light bg-[#595858] flex items-center justify-center gap-2">
          How to Play
          <span className="h-8 aspect-square bg-contain bg-no-repeat bg-[url('/question-circle.svg')]" />
        </button>
      </div>
    </div>
  );
}
