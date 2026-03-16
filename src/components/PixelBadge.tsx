import { cn } from '@/lib/utils';

type BadgeVariant = 'cyan' | 'magenta' | 'violet' | 'gold' | 'silver' | 'bronze' | 'green' | 'red';

const styles: Record<BadgeVariant, string> = {
  cyan: 'border-primary text-primary bg-primary/10',
  magenta: 'border-secondary text-secondary bg-secondary/10',
  violet: 'border-accent text-accent bg-accent/10',
  gold: 'border-rank-gold text-rank-gold bg-rank-gold/10',
  silver: 'border-rank-silver text-rank-silver bg-rank-silver/10',
  bronze: 'border-rank-bronze text-rank-bronze bg-rank-bronze/10',
  green: 'border-green-400 text-green-400 bg-green-400/10',
  red: 'border-red-400 text-red-400 bg-red-400/10',
};

const PixelBadge = ({
  variant = 'cyan',
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={cn(
    'inline-block font-pixel text-[8px] px-2 py-1 border-2 uppercase tracking-wider',
    styles[variant],
    className
  )}>
    {children}
  </span>
);

export default PixelBadge;
