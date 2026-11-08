import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { Presence } from "@convex-dev/presence";
import { authComponent } from "./auth";

export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    // Helpful debugging logs
    console.log("Auth user found:", user?._id);
    console.log("Passed userId:", userId);

    // If a user is logged in, ensure the passed userId matches their authenticated account
    if (user && String(user._id) !== String(userId)) {
      throw new ConvexError(
        `Unauthorized: user mismatch (got ${user._id}, expected ${userId})`,
      );
    }

    // If there is no authenticated user, allow anonymous-guest tracking
    // (or ensure you handle guest tokens safely)

    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    const entries = await presence.list(ctx, roomToken);

    return await Promise.all(
      entries.map(async (entry) => {
        // Attempt to fetch user details from better-auth
        const user = await authComponent
          .getAnyUserById(ctx, entry.userId)
          .catch(() => null);

        if (!user) {
          return {
            ...entry,
            name: "Anonymous Guest", // Safe fallback name for guests in FacePile
          };
        }

        return {
          ...entry,
          name: user.name,
        };
      }),
    );
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});

export const getUserId = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    return user?._id;
  },
});
