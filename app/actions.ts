"use server";

import z from "zod";
import { postSchema } from "./schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { revalidatePath, revalidateTag } from "next/cache";
import { commentSchema } from "./schemas/comments";

export async function createBlogAtion(values: z.infer<typeof postSchema>) {
   const parsed = postSchema.safeParse(values);
    if (!parsed.success) {
     throw new Error('Invalid input');
    }

    const token = await getToken();
    await fetchMutation(api.posts.createPost, {
        body: parsed.data.content,
        title: parsed.data.title
    }, {token: token});
    revalidatePath('/blog');
    return redirect('/blog');
}

export async function createCommentAction(values: z.infer<typeof commentSchema>) {
    const parsed = commentSchema.safeParse(values);
    if (!parsed.success) {
     throw new Error('Invalid input');
    }

    const token = await getToken();
    const commentId = await fetchMutation(api.comments.createComment, {
        body: parsed.data.body,
        postId: parsed.data.postId
    }, {token: token});
    revalidateTag(`comments-${parsed.data.postId}`, 'default');
     return commentId;
}