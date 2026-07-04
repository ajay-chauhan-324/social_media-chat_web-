import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'btn-base bg-brand-600 text-white shadow-glow hover:bg-brand-700 focus-visible:ring-brand-500/40',
  gradient:
    'btn-base bg-brand-gradient bg-[length:200%_200%] text-white shadow-glow hover:animate-gradient-x focus-visible:ring-violet-500/40',
  secondary:
    'btn-base bg-surface text-content border border-line hover:bg-surface-2 focus-visible:ring-brand-500/20',
  ghost: 'btn-base bg-transparent text-content hover:bg-surface-2 focus-visible:ring-brand-500/20',
  outline:
    'btn-base border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white focus-visible:ring-brand-500/30',
  danger: 'btn-base bg-danger text-white hover:brightness-95 focus-visible:ring-danger/40',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-11 w-11',
};

const Button = forwardRef(
  (
    {
      as: Comp = 'button',
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <Comp
      ref={ref}
      className={cn(VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 20 : 16} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </Comp>
  )
);

Button.displayName = 'Button';
export default Button;
