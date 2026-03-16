export default function Footer() {
  return (
    <footer className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between md:items-center gap-1 md:gap-0 px-4 md:px-10 py-1 text-[10px] md:text-xs bg-linear-to-r from-[#000a1e]/95 to-[#001a3e]/95 border-t-2 border-cyan-400 backdrop-blur-md shadow-lg shadow-cyan-400/10">
      <div className="flex items-center gap-3 md:gap-6">
        <span className="text-cyan-400 font-bold">CODE CONUNDRUM v2.6</span>
        <span className="hidden md:inline text-gray-500">•</span>
        <span className="text-gray-400">14 TEAMS ACTIVE</span>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <span className="text-gray-400">
          ⚡ 60 FPS
        </span>
        <span className="hidden md:inline text-gray-500">•</span>
        <span className="text-green-400 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          SECURE
        </span>
      </div>
    </footer>
  );
}