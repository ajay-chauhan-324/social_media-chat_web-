import { z } from 'zod';

export const startPrivateSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
});

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(80),
  memberUsernames: z.array(z.string().trim()).min(1, 'Add at least one member'),
});

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(80),
  description: z.string().trim().max(200).optional().default(''),
});

export const sendMessageSchema = z
  .object({
    content: z.string().trim().max(4000).optional().default(''),
    replyTo: z.string().optional().nullable(),
  })
  .passthrough();

export const editMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const reactMessageSchema = z.object({
  emoji: z.string().trim().min(1, 'Emoji is required').max(8),
});

export const addMembersSchema = z.object({
  usernames: z.array(z.string().trim()).min(1, 'Add at least one member'),
});
