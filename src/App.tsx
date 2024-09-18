export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col items-center bg-[#FBF6CD]">
      <div className="flex flex-row items-center mt-2">
        <h1 className="text-8xl font-bold text-red-500 drop-shadow">UnRavel</h1>
        <img src="/logo.png" className="aspect-square w-28" />
      </div>
      {/* Match selection */}
      <div className="flex flex-row gap-5 w-full h-full p-5 pt-2">
        <div className="bg-[#8FCCE1] h-full w-1/2 rounded-xl p-5">
          {/* Ranked Match */}
          <h2 className="text-5xl font-bold mb-5">Ranked Match</h2>
          <p className="mr-60">
            blah blah blah match yes blah blah blah blah match yes blah blah
            blah blah match yes blah
          </p>
        </div>
        <div className="bg-[#F4868A] h-full w-1/2 rounded-xl p-5">
          {/* Private Match */}
          <h2 className="text-5xl font-bold mb-5">Private Match</h2>
          <p className="mr-60">
            blah blah blah match yes blah blah blah blah match yes blah blah
            blah blah match yes blah
          </p>
        </div>
      </div>
    </div>
  );
}
