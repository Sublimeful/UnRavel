export default function Background() {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full border-2 border-gray-500">
      <div className="aspect-[1] h-full bg-teal-600 rounded-full col-start-3 row-start-1 row-span-2">
      </div>
      <div className="aspect-[1] h-full bg-blue-600 rounded-full col-span-2 row-start-1 rol-span-2">
      </div>
      <div className="aspect-[1] h-full bg-red-600 rounded-full col-start-2 row-start-3">
      </div>
    </div>
  );
}
