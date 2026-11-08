"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/app/schemas/comment";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import z from "zod";
import { toast } from "../ui/toast";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

export function CommentSection(props: {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
  const [isPending, startTransition] = useTransition();
  const params = useParams<{ blogId: Id<"posts"> }>();

  const postId = params.blogId;

  const data = usePreloadedQuery(props.preloadedComments);

  const createComment = useMutation(api.comments.createComment);

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: "",
      postId: postId,
    },
  });

  async function onSubmit(formData: z.infer<typeof commentSchema>) {
    if (!postId) return;

    startTransition(async () => {
      try {
        await createComment({
          body: formData.body,
          postId: postId,
        });
        form.reset({ body: "", postId: postId });
        toast.add({
          type: "success",
          description: "Comment posted",
        });
      } catch {
        toast.add({
          type: "error",
          description: "Failed to create comment",
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-3 border-b ">
        <MessageSquare className="size-5" />
        <h2 className="text-xl font-bold">
          {data ? `${data.length} Comments` : "Comments"}
        </h2>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="body"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Comment</FieldLabel>
                <Textarea
                  aria-invalid={fieldState.invalid}
                  placeholder="Share your thought"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </form>

        {data === undefined ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {data.length > 0 && <Separator />}

            <section className="space-y-6">
              {data.map((comment) => (
                <div key={comment._id} className="flex gap-4 items-start">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${comment.authorName}`}
                    />
                    <AvatarFallback>
                      {comment.authorName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">
                        {comment.authorName}
                      </p>
                      <p className="text-xs text-foreground/90">
                        {new Date(comment._creationTime).toLocaleDateString(
                          "en-US",
                        )}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                      {comment.body}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
