import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { Doc } from "./_generated/dataModel";
import { ar } from "zod/v4/locales";

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

interface searchResultType {
    _id: string;
    title: string;
    body: string;
}

export const searchPosts = query({
    args: {
        term: v.string(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const result: searchResultType[] = [];
        const seen = new Set()
        const pushDocs = async (docs: Array<Doc<'posts'>>) => {
            for(const doc of docs) {
                if(seen.has(doc._id)) continue;
                seen.add(doc._id);
                result.push({
                    _id: doc._id,
                    title: doc.title,
                    body: doc.body,
                });
                if(result.length >= limit) {
                    break;
                }
            }
        }
        const titleMatches = await ctx.db.query("posts").withSearchIndex( 
            'search_title', (q => q.search('title', args.term))
        ).take(limit);
        await pushDocs(titleMatches);
        return result;

    }
})