import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const Textarea = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="mb-1.5 block text-sm font-medium text-content">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        'input-base min-h-[100px] resize-none leading-relaxed',
        error && 'border-danger focus:border-danger focus:ring-danger/15',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';
export default Textarea;
