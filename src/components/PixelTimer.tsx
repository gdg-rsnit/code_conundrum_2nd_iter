import { cn } from '@/lib/utils';

const PixelTimer = ({ 
  minutes, 
  seconds, 
  percentage 
}: { 
  minutes: number; 
  seconds: number; 
  percentage: number;
}) => {
  const color = percentage > 50 
    ? 'text-green-400 neon-text-cyan' 
    : percentage > 25 
    ? 'text-yellow-400' 
    : 'text-red-400';

  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={cn('font-pixel text-2xl md:text-4xl tracking-widest', color)}>
      {timeStr}
    </div>
  );
};

export default PixelTimer;
