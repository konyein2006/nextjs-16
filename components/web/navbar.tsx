"use client";

import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./ModeToggle";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "../ui/toast";
import { useRouter } from "next/navigation";
import { SearchInput } from "./SearchInput";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href={"/"}>
          <h1 className="text-4xl font-bold ">
            Next<span className="text-secondary">Pro</span>
          </h1>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={"/"} className={buttonVariants({ variant: "ghost" })}>
            Home
          </Link>
          <Link href={"/blog"} className={buttonVariants({ variant: "ghost" })}>
            Blog
          </Link>
          <Link
            href={"/create"}
            className={buttonVariants({ variant: "ghost" })}
          >
            Create
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block mr-2">
          <SearchInput />
        </div>
        {isLoading ? null : isAuthenticated ? (
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    toast.add({
                      type: "success",
                      description: "Logged out successfully",
                    });
                    router.push("/");
                  },
                  onError: (error) => {
                    toast.add({
                      type: "error",
                      description: error.error.message,
                    });
                  },
                },
              })
            }
          >
            Logout
          </Button>
        ) : (
          <>
            <Link
              href={"/auth/sign-up"}
              className={buttonVariants({ variant: "default" })}
            >
              Sign up
            </Link>
            <Link
              href={"/auth/login"}
              className={buttonVariants({ variant: "outline" })}
            >
              Login
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
