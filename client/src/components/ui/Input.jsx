import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

const Input = forwardRef(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            className={cn(
              'input-base',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-danger focus:border-danger focus:ring-danger/15',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
