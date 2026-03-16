import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type PixelCardVariant = 'cyan' | 'magenta' | 'violet' | 'gold' | 'default';

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PixelCardVariant;
  glow?: boolean;
  header?: string;
}

const borderMap: Record<PixelCardVariant, string> = {
  cyan: 'pixel-border',
  magenta: 'pixel-border-magenta',
  violet: 'pixel-border-violet',
  gold: 'pixel-border-gold',
  default: 'border-4 border-muted',
};

const glowMap: Record<PixelCardVariant, string> = {
  cyan: 'neon-glow-cyan',
  magenta: 'neon-glow-magenta',
  violet: 'neon-glow-violet',
  gold: 'neon-glow-gold',
  default: '',
};

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ variant = 'cyan', glow = false, header, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card p-4 md:p-6',
          borderMap[variant],
          glow && glowMap[variant],
          className
        )}
        {...props}
      >
        {header && (
          <div className={cn(
            'font-pixel text-[10px] md:text-xs uppercase tracking-wider mb-4 pb-2',
            variant === 'cyan' && 'text-primary border-b-2 border-primary/30',
            variant === 'magenta' && 'text-secondary border-b-2 border-secondary/30',
            variant === 'violet' && 'text-accent border-b-2 border-accent/30',
            variant === 'gold' && 'text-rank-gold border-b-2 border-rank-gold/30',
            variant === 'default' && 'text-muted-foreground border-b-2 border-muted',
          )}>
            {header}
          </div>
        )}
        {children}
      </div>
    );
  }
);

PixelCard.displayName = 'PixelCard';
export default PixelCard;
