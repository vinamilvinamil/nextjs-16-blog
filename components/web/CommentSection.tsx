'use client';
import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { commentSchema } from "@/app/schemas/comments";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import z from "zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { authClient } from "@/lib/auth-client";
import { createCommentAction } from "@/app/actions";

interface iAPpProps {
    postId: Id<'posts'>,
    comments: {
        _id?: Id<'comments'>,
        body: string,
        postId?: Id<'posts'>,
        _creationTime: number,
        authorId?: string,
        authorName: string
    }[]
}

export function CommentSection({ postId, comments }: iAPpProps) {
    const [isPending, startTransition] = useTransition();
    const createComment = useMutation(api.comments.createComment);
    const [newComments, setNewComments] = useState(comments || []);
    const userName = authClient.useSession()?.data?.user?.name || ''; // Get the user's name from the session, or use an empty string if not available
    const form = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            body: '',
            postId: postId
        }
    })
    async function onSubmit(data: z.infer<typeof commentSchema>) {
        startTransition(async () => {
            try {
                setNewComments(prev => [{...data, authorName: userName, _creationTime: Date.now(), }, ...prev])
                // await createComment({
                //     body: data.body,
                //     postId: data.postId
                // })
                await createCommentAction(data);
                form.reset();
                toast.success('Comment created successfully');
            } catch (error: any) {
                setNewComments(prev => {
                    const [firstItem, ...newList] = prev;
                    return newList;
                })
                toast.error(error?.data?.message || 'Failed to create comment');
            }
        });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 border-b">
                <MessageSquare className="size-5" />
                <h2 className="text-xl font-bold"> {newComments.length} Comments</h2>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                        name='body'
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Comment</FieldLabel>
                                <Textarea placeholder='Write a comment...' {...field} aria-invalid={fieldState.invalid} />
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
                        ) : 'Send'}
                    </Button>
                </form> 
                <div className="text-sm text-muted-foreground mt-4">
                    {
                        newComments?.map((comment, index) => (
                            <div key={index} >
                                <Separator className="my-4"/>
                                <div className="flex flex-row items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-bold">{comment.authorName}</p>
                                        <p className="text-muted-foreground">{comment.body}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(comment._creationTime).toLocaleDateString('vi-VN')}</p>
                                </div>
                                
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    )
}
