import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'disabled' | 'gold';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  pixelSize?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<PixelButtonVariant, string> = {
  primary: 'bg-neon-magenta text-foreground pixel-border neon-glow-magenta hover:translate-y-1 hover:shadow-none active:translate-y-1',
  secondary: 'bg-transparent text-primary border-4 border-primary neon-glow-cyan hover:bg-primary/10 hover:translate-y-1 active:translate-y-1',
  danger: 'bg-destructive text-foreground border-4 border-destructive hover:translate-y-1 active:translate-y-1',
  disabled: 'bg-muted text-muted-foreground border-4 border-muted-foreground/30 cursor-not-allowed opacity-50',
  gold: 'bg-rank-gold text-space-navy pixel-border-gold neon-glow-gold hover:translate-y-1 active:translate-y-1',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-[8px]',
  md: 'px-5 py-2.5 text-[10px]',
  lg: 'px-8 py-4 text-xs',
};

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ variant = 'primary', pixelSize = 'md', className, children, disabled, ...props }, ref) => {
    const v = disabled ? 'disabled' : variant;
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'font-pixel uppercase tracking-wider transition-all duration-100 cursor-pointer select-none',
          'pixel-shadow',
          variantStyles[v],
          sizeStyles[pixelSize],
          className
        )}
        {...props}
      >
        [ {children} ]
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';
export default PixelButton;
