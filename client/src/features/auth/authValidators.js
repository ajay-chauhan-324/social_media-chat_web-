import { z } from 'zod';

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'At least 3 characters')
    .max(30)
    .regex(/^[a-z0-9_.]+$/, 'Letters, numbers, "_" and "." only'),
  email: z.string().trim().email('Enter a valid email'),
  password,
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean().optional(),
});

export const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export const resetSchema = z
  .object({
    password,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
