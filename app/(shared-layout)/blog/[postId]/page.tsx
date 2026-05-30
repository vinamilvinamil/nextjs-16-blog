import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";

interface PostIdRouteProps {
    params: Promise<{ postId: Id<"posts"> }>;
}

export async function generateMetadata({ params }: PostIdRouteProps) {
    const { postId } = await params;

    const getPost = unstable_cache(
        async (postId: Id<"posts"> ) => {
            return fetchQuery(api.posts.getPostById, { postId })
        },
        ['post', postId],
        {
            tags: [`post-${postId}`],
            revalidate: 86400,
        }
    )
    const post = await getPost(postId);
    if (!post) {
        return {
            title: 'Post not found',
        }
    }
    return {
        title: post.title,
        description: post.body.slice(0, 160),
        category: 'Web development',
        authors: [{ name: 'Huu Dat' }],
    }
}

export default async function PostIdRoute({params}: PostIdRouteProps) {
    const { postId } = await params;

    const getPost = unstable_cache(
        async (postId: Id<"posts"> ) => {
            return fetchQuery(api.posts.getPostById, { postId })
        },
        ['post', postId],
        {
            tags: [`post-${postId}`],
            revalidate: 86400,
        }
    )

    const getComments = unstable_cache(
        async (postId: Id<"posts">) => {
            return fetchQuery(api.comments.getComments, { postId })
        },
        ['comments', postId],
        {
            tags: [`comments-${postId}`],
            revalidate: 86400,
        }
    )

    const [post, comments] = await Promise.all([
        await getPost(postId),
        await getComments(postId)
    ])
    if(!post) {
        return (
            <div>
                <h1 className="text-6xl font-extrabold text-red-500">
                    No Data found
                </h1>
            </div>
        )
    }
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
            <Link href={'/blog'} className={buttonVariants({variant: 'ghost', className: 'mb-4'})}>
                <ArrowLeft className="size-4"/>
                Back to Blog
            </Link>
            <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
                <Image 
                    src={'https://images.unsplash.com/photo-1778984136296-00ccc5eb2092?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="space-y-4 flex flex-col">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {post.title}
                </h1>
                <p className="text-sm text-muted-foreground">Post on: {new Date(post._creationTime).toLocaleDateString('vi-VN')}</p>
            </div>
            <Separator className="my-8"/>
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.body}</p>

            <Separator className="my-8"/>

            <CommentSection postId={postId} comments={comments}/>
        </div>
    )
}