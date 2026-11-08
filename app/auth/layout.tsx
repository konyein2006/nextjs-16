import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Link href={"/"} className="absolute top-5 left-5">
        <div className={buttonVariants({ variant: "secondary" })}>
          <ArrowLeft />
          Go Back
        </div>
      </Link>
      <div className=" w-full max-w-md mx-auto">{children}</div>
    </div>
  );
}
