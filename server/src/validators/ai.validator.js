import { z } from 'zod';

export const chatSchema = z.object({
  conversationId: z.string().optional().nullable(),
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
  tool: z.string().optional(),
});

export const toolSchema = z.object({
  tool: z.string().min(1, 'Tool is required'),
  input: z.string().trim().min(1, 'Input cannot be empty').max(4000),
  save: z.boolean().optional(),
});

export const confirmSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  confirm: z.boolean(),
});
