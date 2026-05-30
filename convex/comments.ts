import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

export const getComments = query({
    args: {
        postId: v.id('posts')
    },
    handler: async (ctx, args) => {
        const data = await ctx.db.query('comments').filter( q => q.eq(q.field('postId'), args.postId)).order('desc').collect();

        return data;
    }
})

export const createComment = mutation({
    args: {
        body: v.string(),
        postId: v.id('posts')
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if(!user) {
            throw new ConvexError({
                code: 'NOT_AUTHENTICATED',
                message: 'Not authenticated',
            });
        }
        await ctx.db.insert('comments', {
            postId: args.postId,
            body: args.body,
            authorId: user._id,
            authorName: user.name
        })
    }
})