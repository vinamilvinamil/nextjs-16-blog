'use client'

import { createBlogAtion } from "@/app/actions";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function CreatePost() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const mutation = useMutation(api.posts.createPost);
    const form = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: '',
            content: ''
        }
    })

    async function onSubmit(values: z.infer<typeof postSchema>) {
        startTransition(async () => {
            //Create from client action
            // mutation({
            //     body: values.content,
            //     title: values.title
            // })

            //create from server action
            await createBlogAtion(values);
            // await fetch('/api/create-blog', {
            //     method: 'POST',
                 
            // });
            toast.success('Post created successfully');
            router.push('/blog');
        })
    }

    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-semibold font-extrabold tracking-tight sm:text-5xl">Create Post</h1>
                <p className="text-xl text-muted-foreground pt-4">Create your own blog article....</p>
            </div>

            <Card className="w-full max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Blog Article</CardTitle>
                    <CardDescription>Start creating your blog article by filling out the form below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-y-4">
                            <Controller
                                name='title'
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Title</FieldLabel>
                                        <Input placeholder='Post Title' {...field} aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name='content'
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Content</FieldLabel>
                                        <Textarea placeholder='Post Content' {...field} aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Button type='submit' disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className='size-4 animate-spin' />
                                        <span>Loading...</span>
                                    </>
                                ) : 'Create Post'}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}