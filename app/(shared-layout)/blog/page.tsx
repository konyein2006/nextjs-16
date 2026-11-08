import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog | Next.js 16 Tutorial",
  description: "Read our latest articles and insights.",
  category: "Web development",
  authors: [{ name: "Jan marshanl" }],
};

export default function BlogPage() {
  return (
    <div className="my-12 text-center max-w-6xl mx-auto">
      <div className="text-center my-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold pb-5 tracking-tight">
          Our Blog
        </h1>
        <p className="text-muted-foreground text-xl mx-auto max-w-2xl ">
          Insights, thoughts, and trends from our team.
        </p>
      </div>
      <Suspense fallback={<SkeletonLoadingUi />}>
        <BlogList />
      </Suspense>
    </div>
  );
}

async function BlogList() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const data = await fetchQuery(api.post.getPosts);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => (
        <Card key={post._id} className="pt-0">
          <div className="relative h-50 w-full overflow-hidden">
            <Image
              src={
                post.imageUrl ??
                "https://images.unsplash.com/photo-1515900959941-d1cce424f5c4?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
              }
              alt="image"
              fill
              className="rounded-t-lg hover:scale-105 object-cover"
            />
          </div>
          <CardContent className="text-start ">
            <Link href={`/blog/${post._id}`}>
              <p className="text-2xl font-semibold hover:text-secondary">
                {post.title}
              </p>
            </Link>
            <p className="text-muted-foreground text-base line-clamp-3">
              {post.body}
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href={`/blog/${post._id}`}
              className={buttonVariants({
                className: "w-full ",
              })}
            >
              Read more
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function SkeletonLoadingUi() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col gap-5 spacey-3">
          <Skeleton className="h-48 w-full rounded-2xl"></Skeleton>
          <div className="space-y-2 flex flex-col">
            <Skeleton className="h-4 w-2/3"></Skeleton>
            <Skeleton className="h-4 w-3/4"></Skeleton>
            <Skeleton className="h-6 w-full"></Skeleton>
          </div>
        </div>
      ))}
    </div>
  );
}
