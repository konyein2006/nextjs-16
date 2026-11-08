"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";
import { useState } from "react";

interface iAppProps {
  roomId: Id<"posts">;
  userId?: string;
}

export function PostPresence({ roomId, userId }: iAppProps) {
  // Use a lazy initializer function to get or create the guest ID safely on mount
  const [guestId] = useState<string>(() => {
    // Check if we are in the browser environment
    if (typeof window === "undefined") return "";

    let storedId = localStorage.getItem("blog_guest_id");
    if (!storedId) {
      storedId = `guest-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("blog_guest_id", storedId);
    }
    return storedId;
  });

  const effectiveUserId = userId ?? guestId;

  const presenceState = usePresence(
    api.presence,
    roomId as string,
    effectiveUserId,
  );

  if (!effectiveUserId || !presenceState || presenceState.length === 0)
    return null;

  return (
    <div className="flex items-center gap-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Viewing now
      </p>
      <div>
        <FacePile presenceState={presenceState} />
      </div>
    </div>
  );
}
