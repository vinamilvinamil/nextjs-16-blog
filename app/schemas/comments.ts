import { z } from "zod";
import {Id} from '@/convex/_generated/dataModel';
export const commentSchema = z.object({
    body: z.string().min(1, "Comment cannot be empty").max(500, "Comment cannot exceed 500 characters"),
    postId: z.custom<Id<'posts'>>()
})