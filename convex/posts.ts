import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

export const createPost = mutation({
    args: {title: v.string(), body: v.string()},
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if(!user) {
            throw new ConvexError('Not authenticated');
        }

        const blogArticle = await ctx.db.insert("posts", {
            body: args.body,
            title: args.title,
            authorId: user._id,
        });
        return blogArticle;
    },
})

export const getPosts = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db.query("posts").order('desc').collect();
        return posts;
    }
})

export const getPostById = query({
    args: {
        postId: v.id('posts')
    }, 
    handler: (ctx, args) => {
        const post = ctx.db.get(args.postId);
        if(!post) {
            return null;
        }
        return post;
    }
})