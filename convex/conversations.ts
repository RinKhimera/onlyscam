import { ConvexError, v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const createConversation = mutation({
  args: {
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.id("_storage")),
    admin: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Unauthorized")

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participants"), args.participants),
          q.eq(q.field("participants"), args.participants.reverse()),
        ),
      )
      .first()

    if (existingConversation) {
      return existingConversation._id
    }

    let groupImage

    if (args.groupImage) {
      groupImage = (await ctx.storage.getUrl(args.groupImage)) as string
    }

    const conversationId = await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      groupName: args.groupName,
      groupImage,
      admin: args.admin,
    })

    return conversationId
  },
})

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    const conversations = await ctx.db.query("conversations").collect()

    const myConversations = conversations.filter((conversation) => {
      return conversation.participants.includes(user._id)
    })

    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conversation) => {
        let userDetails = {}

        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find(
            (id) => id !== user._id,
          )
          const userProfile = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), otherUserId))
            .take(1)

          userDetails = userProfile[0]
        }

        const lastMessage = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversation"), conversation._id))
          .order("desc")
          .take(1)

        // Vérifier s'il y a des messages non lus pour l'utilisateur actuel
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversation", conversation._id),
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("read"), false),
              q.neq(q.field("sender"), user._id), // Ne pas compter les messages envoyés par l'utilisateur
            ),
          )
          .collect()

        const hasUnreadMessages = unreadMessages.length > 0

        // return should be in this order, otherwise _id field will be overwritten
        return {
          ...userDetails,
          ...conversation,
          lastMessage: lastMessage[0] || null,
          lastActivityTime: lastMessage[0]
            ? lastMessage[0]._creationTime
            : conversation._creationTime,
          hasUnreadMessages,
          unreadCount: unreadMessages.length,
        }
      }),
    )

    // Trier les conversations par date du dernier message (du plus récent au plus ancien)
    const sortedConversations = conversationsWithDetails.sort(
      (a, b) => b.lastActivityTime - a.lastActivityTime,
    )

    return sortedConversations
  },
})

// export const kickUser = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     userId: v.id("users"),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity()
//     if (!identity) throw new ConvexError("Unauthorized")

//     const conversation = await ctx.db
//       .query("conversations")
//       .filter((q) => q.eq(q.field("_id"), args.conversationId))
//       .unique()

//     if (!conversation) throw new ConvexError("Conversation not found")

//     await ctx.db.patch(args.conversationId, {
//       participants: conversation.participants.filter(
//         (id) => id !== args.userId
//       ),
//     })
//   },
// })

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})

export const getCurrentConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .unique()

    return existingConversation
  },
})

export const getGroupMembers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) throw new ConvexError("Unauthorized")

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .first()

    if (!conversation) throw new ConvexError("Conversation not found")

    const users = await ctx.db.query("users").collect()

    const groupMembers = users.filter((user) =>
      conversation.participants.includes(user._id),
    )

    return groupMembers
  },
})
