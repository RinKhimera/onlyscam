import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Optimized
export const getMessages = query({
  args: {
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversation),
      )
      .collect()

    const userProfileCache = new Map()

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        let sender
        // Check if sender profile is in cache
        if (userProfileCache.has(message.sender)) {
          sender = userProfileCache.get(message.sender)
        } else {
          // Fetch sender profile from the database
          sender = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), message.sender))
            .first()
          // Cache the sender profile
          userProfileCache.set(message.sender, sender)
        }

        return { ...message, sender }
      }),
    )

    return messagesWithSender
  },
})

export const sendTextMessage = mutation({
  args: {
    sender: v.id("users"),
    content: v.string(),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) {
      throw new ConvexError("User not found")
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversation))
      .first()

    if (!conversation) {
      throw new ConvexError("Conversation not found")
    }

    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError("You are not part of this conversation")
    }

    await ctx.db.insert("messages", {
      sender: args.sender,
      content: args.content,
      conversation: args.conversation,
      messageType: "text",
    })
  },
})

export const sendImage = mutation({
  args: {
    imgUrl: v.string(),
    sender: v.id("users"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Not authenticated")
    }

    await ctx.db.insert("messages", {
      content: args.imgUrl,
      sender: args.sender,
      messageType: "image",
      conversation: args.conversation,
    })
  },
})

export const sendVideo = mutation({
  args: {
    videoId: v.id("_storage"),
    sender: v.id("users"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Not authenticated")
    }

    const content = (await ctx.storage.getUrl(args.videoId)) as string

    await ctx.db.insert("messages", {
      content: content,
      sender: args.sender,
      messageType: "video",
      conversation: args.conversation,
    })
  },
})
