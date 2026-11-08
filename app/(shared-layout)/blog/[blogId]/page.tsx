import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { PostPresence } from "@/components/web/PostPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@convex-dev/better-auth/utils";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

interface PostIdRouteProps {
  params: Promise<{
    blogId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PostIdRouteProps): Promise<Metadata> {
  const { blogId } = await params;

  // Opt this metadata generation into dynamic request-time rendering
  await connection();

  try {
    const post = await fetchQuery(api.post.getPostById, {
      postId: blogId as Id<"posts">,
    });

    if (!post) {
      return { title: "Post not found" };
    }

    return {
      title: post.title,
      description: post.body.slice(0, 160),
    };
  } catch {
    return {
      title: "Blog Post",
    };
  }
}
// 1. Await params and fetch data inside the Suspense-wrapped component
async function PostContent({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const resolvedParams = await params;
  const blogId = resolvedParams?.blogId;
  // 1. Get incoming request headers
  const requestHeaders = new Headers(await headers());

  // 2. Pass the required arguments to getToken
  // (Adjust the first argument based on how your better-auth config expects the site/convex URL)
  const tokenObj = await getToken(
    process.env.NEXT_PUBLIC_CONVEX_URL!,
    requestHeaders,
  );
  const token = tokenObj?.token;

  if (!blogId) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-extrabold text-red-500">
          Invalid Post ID
        </h1>
      </div>
    );
  }

  await connection(); // Safe inside Suspense

  const [post, preloadedComments, userId] = await Promise.all([
    await fetchQuery(api.post.getPostById, {
      postId: blogId as Id<"posts">,
    }),
    await preloadQuery(api.comments.getCommentsByPostId, {
      postId: blogId as Id<"posts">,
    }),
    await fetchQuery(api.presence.getUserId, {}, { token }),
  ]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-6xl font-extrabold text-red-500 py-20 text-center">
          No post found
        </h1>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-100 mb-8 rounded-xl overflow-hidden shadow-md">
        <Image
          src={
            post.imageUrl ??
            "https://images.unsplash.com/photo-1515900959941-d1cce424f5c4?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          }
          alt={post.title}
          fill
          className="object-cover hover:scale-105"
        />
      </div>

      <div className="flex flex-col gap-5">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div>
          <p className="text-sm text-foreground/90">
            Posted on:{" "}
            {new Date(post._creationTime).toLocaleDateString("en-US")}
          </p>
          {userId && <PostPresence roomId={post._id} userId={userId} />}
        </div>
      </div>
      <Separator className="my-8" />
      <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
        {post.body}
      </p>
      <Separator className="my-8" />
      <CommentSection preloadedComments={preloadedComments} />
    </>
  );
}

// 2. Main page component remains clean and static-friendly
export default function PostIdRoute({ params }: PostIdRouteProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
      <Link
        href={"/blog"}
        className={buttonVariants({
          variant: "outline",
          className: "mb-6",
        })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to blog
      </Link>

      <PostContent params={params} />
    </div>
  );
}
