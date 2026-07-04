import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, resolving Tailwind conflicts intelligently. */
export const cn = (...inputs) => twMerge(clsx(inputs));
