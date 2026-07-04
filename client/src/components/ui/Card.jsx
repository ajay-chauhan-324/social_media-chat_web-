import { cn } from '@/lib/cn';

export default function Card({ as: Comp = 'div', className, hover = false, children, ...props }) {
  return (
    <Comp
      className={cn(
        'card p-5',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
