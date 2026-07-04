import { z } from 'zod';

export const createPostSchema = z
  .object({
    content: z.string().trim().max(3000, 'Post is too long').optional().default(''),
    visibility: z.enum(['public', 'followers']).optional().default('public'),
    status: z.enum(['published', 'draft']).optional().default('published'),
  })
  // Images are validated by multer; text may be empty when images are attached.
  .passthrough();

export const updatePostSchema = z.object({
  content: z.string().trim().max(3000).optional(),
  visibility: z.enum(['public', 'followers']).optional(),
});
