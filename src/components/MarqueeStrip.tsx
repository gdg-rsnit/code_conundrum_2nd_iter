const MarqueeStrip = ({ text }: { text: string }) => (
  <div className="w-full overflow-hidden bg-space-navy border-t-2 border-b-2 border-secondary/30 py-2">
    <div className="animate-marquee whitespace-nowrap font-pixel text-[10px] text-secondary">
      {text} &nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp; {text}
    </div>
  </div>
);

export default MarqueeStrip;
