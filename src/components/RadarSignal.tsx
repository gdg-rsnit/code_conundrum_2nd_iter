const RadarSignal = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      {/* Center dot */}
      <div className="absolute" style={{ width: 8, height: 8, background: 'hsl(var(--neon-cyan))' }} />
      {/* Expanding squares */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute"
          style={{
            width: [32, 56, 80][i],
            height: [32, 56, 80][i],
            border: '2px solid hsl(var(--neon-cyan))',
            borderRadius: 0,
            animation: `radar-expand 2s infinite`,
            animationDelay: `${i * 0.66}s`,
          }}
        />
      ))}
    </div>
    <span className="font-pixel text-[9px] text-primary animate-blink-cursor">
      AWAITING SIGNAL
    </span>
  </div>
);

export default RadarSignal;
