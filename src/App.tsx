export default function App() {
  return (
    <div className="h-screen w-screen bg-[#040039]">
      <div className="absolute h-full w-full grid grid-rows-10 grid-cols-10">
        {/* RED */}
        <div className="row-start-2 col-start-2 row-span-3 col-span-2 bg-[#E24F3B] rounded-full h-full aspect-square place-self-center" />
        {/* CYAN */}
        <div className="row-start-1 col-start-7 row-span-5 col-span-4 bg-[#4DDBDB] rounded-full h-full aspect-square place-self-center" />
        {/* BLUE */}
        <div className="row-start-7 col-start-3 row-span-4 col-span-3 bg-[#4754E5] rounded-full h-full aspect-square place-self-center" />
      </div>
    </div>
  );
}
