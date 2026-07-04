import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
  parent: z.string().optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
});
