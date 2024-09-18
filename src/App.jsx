export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col items-center bg-[#FBF6CD]">
      <div className="flex flex-row items-center mt-2">
        <h1 className="text-8xl font-bold text-red-500 drop-shadow">UnRavel</h1>
        <img src="/logo.png" className="aspect-square w-28" />
      </div>
      {/* Match selections */}
      <div className="flex flex-row gap-5 w-full h-full p-5 pt-2">
        <div className="bg-[#8FCCE1] h-full w-1/2 rounded-xl"></div>
        <div className="bg-[#F4868A] h-full w-1/2 rounded-xl"></div>
      </div>
    </div>
  );
}
