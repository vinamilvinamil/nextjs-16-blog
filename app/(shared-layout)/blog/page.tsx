import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

// export const dynamic = "force-static"
// export const revalidate = 300

export const metadata: Metadata = {
    title: 'Blog | Nextjs tutorial',
    description: 'This is our blog page where we share our thoughts and insights on web development, programming, and technology. Stay tuned for the latest updates and articles from our team.',
    category: 'Web development',
    authors: [{ name: 'Huu Dat' }],
}

export default function BlogPage() {
    return (
        <div className="py-12">
            <div className="text-center pb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Blog</h1>
                <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">Insights, thoughts, and stories from our team.</p>
            </div>
            <Suspense fallback={<SKeletonLoadingUi/>}>
            <LoadBlogPosts />
            </Suspense>
        </div>
    )
}

async function LoadBlogPosts() {
    await connection();
    const data = await fetchQuery(api.posts.getPosts, {});
    return (
        <div className=" grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((post) => (
                <Card key={post._id}>
                    <div className="relative h-48 w-full overflow-hidden">
                        <Image src={'https://images.unsplash.com/photo-1778984136296-00ccc5eb2092?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                            fill alt="image" />
                    </div>
                    <CardContent>
                        <Link href={`/blog/${post._id}`}>
                            <h1 className="text-2xl font-bold">{post.title}</h1>
                        </Link>

                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function SKeletonLoadingUi() {
    return (
        <div className=" grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-48 w-full rounded-xl"/>
                        <Skeleton className="h-6 w-full"/>
                    </div>
                ))}
            </div>
    )
}