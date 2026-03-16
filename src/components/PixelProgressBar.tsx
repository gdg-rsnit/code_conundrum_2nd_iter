import { cn } from '@/lib/utils';

const PixelProgressBar = ({
  value,
  max,
  variant = 'cyan',
  label,
  className,
}: {
  value: number;
  max: number;
  variant?: 'cyan' | 'magenta' | 'green' | 'gold';
  label?: string;
  className?: string;
}) => {
  const pct = Math.min((value / max) * 100, 100);
  const colors = {
    cyan: 'bg-primary',
    magenta: 'bg-secondary',
    green: 'bg-green-400',
    gold: 'bg-rank-gold',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="font-pixel text-[8px] text-muted-foreground mb-1 uppercase">
          {label}: {value}/{max}
        </div>
      )}
      <div className="h-4 bg-muted border-2 border-muted-foreground/20 relative overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', colors[variant])}
          style={{ width: `${pct}%` }}
        >
          {/* Pixel block segments */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.ceil(pct / 5) }).map((_, i) => (
              <div key={i} className="h-full w-[5%] border-r border-background/20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelProgressBar;
