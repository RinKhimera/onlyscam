import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getUserNotifications = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .collect()

    const userNotificationsWithDetails = await Promise.all(
      userNotifications.map(async (notification) => {
        if (notification.type === "newSubscription" || "renewSubscription") {
          const sender = await ctx.db
            .query("users")
            .withIndex("by_id", (q) => q.eq("_id", notification.sender!))
            .unique()

          return { ...notification, sender }
        }
        // (
        //   notification.type === "like" ||
        //   "comment" ||
        //   "newPost from followings"
        // )
        else {
          const sender = await ctx.db
            .query("users")
            .withIndex("by_id", (q) => q.eq("_id", notification.sender!))
            .unique()

          const post = await ctx.db
            .query("posts")
            .withIndex("by_id", (q) => q.eq("_id", notification.post!))
            .unique()

          return { ...notification, post, sender }
        }
      }),
    )

    return userNotificationsWithDetails
  },
})
