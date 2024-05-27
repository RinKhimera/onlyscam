import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.optional(v.string()),
    email: v.string(),
    image: v.string(),
    imageBanner: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    socials: v.optional(v.array(v.string())),
    accountType: v.string(),
    isOnline: v.boolean(),
    tokenIdentifier: v.string(),
    following: v.optional(v.array(v.string())),
    followers: v.optional(v.array(v.string())),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_username", ["username"]),

  posts: defineTable({
    author: v.id("users"),
    content: v.string(),
    medias: v.array(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
  }).index("by_author", ["author"]),

  comments: defineTable({
    author: v.id("users"),
    post: v.id("posts"),
    content: v.string(),
    likes: v.array(v.id("users")),
    // subComments: v.optional(v.array(v.id("comments"))),
  }).index("by_post", ["post"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    admin: v.optional(v.id("users")),
  }),

  messages: defineTable({
    conversation: v.id("conversations"),
    sender: v.id("users"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
    ),
  }).index("by_conversation", ["conversation"]),
})
