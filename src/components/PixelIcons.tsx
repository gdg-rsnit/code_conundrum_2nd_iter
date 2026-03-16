// All pixel art SVG icons — no emoji, no icon libraries
// Every icon uses shape-rendering="crispEdges", rect/polyline only, viewBox multiples of 8

export const ClockIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 4px #00F5FF)' }}>
    <rect x="1" y="0" width="14" height="1" fill="white" />
    <rect x="0" y="1" width="1" height="14" fill="white" />
    <rect x="15" y="1" width="1" height="14" fill="white" />
    <rect x="1" y="15" width="14" height="1" fill="white" />
    <rect x="7" y="3" width="2" height="5" fill="white" />
    <rect x="7" y="7" width="5" height="2" fill="white" />
  </svg>
);

export const TeamIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
    <rect x="2" y="2" width="4" height="4" fill="#00F5FF" />
    <rect x="3" y="6" width="2" height="1" fill="#00F5FF" />
    <rect x="1" y="7" width="6" height="5" fill="#00F5FF" />
    <rect x="10" y="2" width="4" height="4" fill="#00F5FF" />
    <rect x="11" y="6" width="2" height="1" fill="#00F5FF" />
    <rect x="9" y="7" width="6" height="5" fill="#00F5FF" />
  </svg>
);

export const TrophyIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }}>
    <rect x="4" y="1" width="8" height="8" fill="#FFD700" />
    <rect x="2" y="1" width="2" height="4" fill="#FFD700" />
    <rect x="12" y="1" width="2" height="4" fill="#FFD700" />
    <rect x="6" y="9" width="4" height="3" fill="#FFD700" />
    <rect x="4" y="12" width="8" height="2" fill="#FFD700" />
  </svg>
);

export const RoundsIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
    <rect x="1" y="1" width="4" height="4" fill="#A855F7" />
    <rect x="6" y="2" width="9" height="2" fill="#A855F7" />
    <rect x="1" y="6" width="4" height="4" fill="#A855F7" />
    <rect x="6" y="7" width="9" height="2" fill="#A855F7" />
    <rect x="1" y="11" width="4" height="4" fill="#A855F7" />
    <rect x="6" y="12" width="9" height="2" fill="#A855F7" />
  </svg>
);

export const CrownIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}>
    <rect x="2" y="16" width="20" height="4" fill="#FFD700" />
    <rect x="2" y="8" width="4" height="8" fill="#FFD700" />
    <rect x="6" y="10" width="4" height="6" fill="#FFD700" />
    <rect x="10" y="4" width="4" height="12" fill="#FFD700" />
    <rect x="14" y="10" width="4" height="6" fill="#FFD700" />
    <rect x="18" y="8" width="4" height="8" fill="#FFD700" />
  </svg>
);

export const MedalIcon = ({ rank, size = 28, className = '' }: { rank: 2 | 3; size?: number; className?: string }) => {
  const fill = rank === 2 ? '#C0C0C0' : '#CD7F32';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className={className} style={{ filter: `drop-shadow(0 0 6px ${fill})` }}>
      <rect x="8" y="2" width="8" height="2" fill={fill} />
      <rect x="6" y="4" width="2" height="2" fill={fill} />
      <rect x="16" y="4" width="2" height="2" fill={fill} />
      <rect x="4" y="6" width="2" height="8" fill={fill} />
      <rect x="18" y="6" width="2" height="8" fill={fill} />
      <rect x="6" y="14" width="2" height="2" fill={fill} />
      <rect x="16" y="14" width="2" height="2" fill={fill} />
      <rect x="8" y="16" width="8" height="2" fill={fill} />
      <rect x="6" y="6" width="12" height="8" fill={fill} opacity={0.3} />
      <text x="12" y="14" textAnchor="middle" fontFamily="'Press Start 2P'" fontSize="8" fill="white">{rank}</text>
    </svg>
  );
};

export const StarPixel = ({ className = '' }: { className?: string }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 4px #FFD700)' }}>
    <rect x="7" y="0" width="2" height="16" fill="#FFD700" />
    <rect x="0" y="7" width="16" height="2" fill="#FFD700" />
    <rect x="3" y="3" width="2" height="2" fill="#FFD700" />
    <rect x="11" y="3" width="2" height="2" fill="#FFD700" />
    <rect x="3" y="11" width="2" height="2" fill="#FFD700" />
    <rect x="11" y="11" width="2" height="2" fill="#FFD700" />
  </svg>
);

export const PixelRocket = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 8px #00F5FF)', willChange: 'transform' }}>
    {/* Nose cone */}
    <rect x="14" y="2" width="4" height="2" fill="#EF4444" />
    <rect x="13" y="4" width="6" height="2" fill="#EF4444" />
    {/* Body */}
    <rect x="12" y="6" width="8" height="12" fill="#D1D5DB" />
    {/* Window */}
    <rect x="14" y="8" width="4" height="4" fill="#06B6D4" />
    {/* Fins */}
    <rect x="8" y="16" width="4" height="4" fill="#06B6D4" />
    <rect x="20" y="16" width="4" height="4" fill="#06B6D4" />
    {/* Flame */}
    <rect x="13" y="20" width="6" height="2" fill="#FDE047" className="animate-flame" />
    <rect x="14" y="22" width="4" height="2" fill="#F97316" className="animate-flame" />
    <rect x="15" y="24" width="2" height="2" fill="#EF4444" className="animate-flame" />
  </svg>
);

export const PixelSatellite = ({ size = 48, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 48 24" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 6px #9B30FF)', willChange: 'transform' }}>
    {/* Left solar panel */}
    <rect x="2" y="9" width="14" height="4" fill="#1E3A5F" />
    <rect x="4" y="9" width="1" height="4" fill="#00F5FF" opacity={0.5} />
    <rect x="8" y="9" width="1" height="4" fill="#00F5FF" opacity={0.5} />
    <rect x="12" y="9" width="1" height="4" fill="#00F5FF" opacity={0.5} />
    {/* Body */}
    <rect x="18" y="7" width="10" height="10" fill="#9CA3AF" />
    {/* Right solar panel */}
    <rect x="30" y="9" width="14" height="4" fill="#1E3A5F" />
    <rect x="33" y="9" width="1" height="4" fill="#00F5FF" opacity={0.5} />
    <rect x="37" y="9" width="1" height="4" fill="#00F5FF" opacity={0.5} />
    <rect x="41" y="9" width="1" height="4" fill="#00F5FF" opacity={0.5} />
    {/* Antenna */}
    <rect x="22" y="1" width="1" height="6" fill="#9CA3AF" />
    <rect x="20" y="0" width="5" height="2" fill="#D1D5DB" />
  </svg>
);

export const PixelPlanetPurple = ({ size = 120, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 12px #9B30FF)', willChange: 'transform' }}>
    {/* Body - stepped circle */}
    <rect x="40" y="16" width="40" height="4" fill="#6B21A8" />
    <rect x="28" y="20" width="64" height="4" fill="#6B21A8" />
    <rect x="20" y="24" width="80" height="4" fill="#6B21A8" />
    <rect x="16" y="28" width="88" height="64" fill="#6B21A8" />
    <rect x="20" y="92" width="80" height="4" fill="#6B21A8" />
    <rect x="28" y="96" width="64" height="4" fill="#6B21A8" />
    <rect x="40" y="100" width="40" height="4" fill="#6B21A8" />
    {/* Craters */}
    <rect x="36" y="40" width="8" height="6" fill="#4C1D95" />
    <rect x="60" y="52" width="10" height="8" fill="#4C1D95" />
    <rect x="44" y="70" width="6" height="4" fill="#4C1D95" />
    <rect x="72" y="36" width="8" height="6" fill="#4C1D95" />
    <rect x="52" y="84" width="6" height="4" fill="#4C1D95" />
    {/* Shadow band */}
    <rect x="80" y="28" width="20" height="64" fill="#3B0764" opacity={0.6} />
    {/* Ring */}
    <rect x="4" y="54" width="112" height="4" fill="#A855F7" opacity={0.7} />
    <rect x="8" y="58" width="104" height="2" fill="#A855F7" opacity={0.4} />
  </svg>
);

export const PixelPlanetTeal = ({ size = 80, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 10px #00F5FF)', willChange: 'transform' }}>
    <rect x="28" y="8" width="24" height="4" fill="#0D9488" />
    <rect x="16" y="12" width="48" height="4" fill="#0D9488" />
    <rect x="12" y="16" width="56" height="48" fill="#0D9488" />
    <rect x="16" y="64" width="48" height="4" fill="#0D9488" />
    <rect x="28" y="68" width="24" height="4" fill="#0D9488" />
    {/* Highlight */}
    <rect x="16" y="20" width="8" height="40" fill="#5EEAD4" opacity={0.5} />
    {/* Craters */}
    <rect x="32" y="28" width="6" height="4" fill="#0F766E" />
    <rect x="48" y="44" width="8" height="6" fill="#0F766E" />
    <rect x="36" y="56" width="4" height="4" fill="#0F766E" />
    {/* Shadow */}
    <rect x="52" y="16" width="16" height="48" fill="#042F2E" opacity={0.5} />
  </svg>
);

export const PixelPlanetRed = ({ size = 55, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" shapeRendering="crispEdges" className={className} style={{ filter: 'drop-shadow(0 0 8px #F97316)', willChange: 'transform' }}>
    <rect x="20" y="4" width="16" height="4" fill="#C2410C" />
    <rect x="12" y="8" width="32" height="4" fill="#C2410C" />
    <rect x="8" y="12" width="40" height="32" fill="#C2410C" />
    <rect x="12" y="44" width="32" height="4" fill="#C2410C" />
    <rect x="20" y="48" width="16" height="4" fill="#C2410C" />
    <rect x="20" y="20" width="6" height="4" fill="#7C2D12" />
    <rect x="34" y="32" width="4" height="4" fill="#7C2D12" />
    <rect x="36" y="12" width="12" height="32" fill="#450A0A" opacity={0.4} />
  </svg>
);
