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
    bookmarks: v.optional(v.array(v.id("posts"))),
    isOnline: v.boolean(),
    tokenIdentifier: v.string(),
    externalId: v.optional(v.string()),
    accountType: v.union(
      v.literal("USER"),
      v.literal("CREATOR"),
      v.literal("SUPERUSER"),
    ),
    creatorApplicationStatus: v.optional(
      v.union(
        v.literal("none"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
    ),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_username", ["username"])
    .index("byExternalId", ["externalId"]),

  creatorApplications: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    identityDocuments: v.array(
      v.object({
        type: v.union(
          v.literal("identity_card"),
          v.literal("passport"),
          v.literal("driving_license"),
          v.literal("selfie"),
        ),
        url: v.string(),
        publicId: v.string(),
        uploadedAt: v.number(),
      }),
    ),
    personalInfo: v.object({
      fullName: v.string(),
      dateOfBirth: v.string(),
      address: v.string(),
      phoneNumber: v.string(),
    }),
    applicationReason: v.string(),
    adminNotes: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  validationDocumentsDraft: defineTable({
    userId: v.id("users"),
    publicId: v.string(),
    documentType: v.union(v.literal("identity_card"), v.literal("selfie")),
  })
    .index("by_userId", ["userId"])
    .index("by_publicId", ["publicId"]),

  posts: defineTable({
    author: v.id("users"),
    content: v.string(),
    medias: v.array(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
    visibility: v.optional(
      v.union(v.literal("public"), v.literal("subscribers_only")),
    ),
  })
    .index("by_author", ["author"])
    .index("by_visibility", ["visibility"]),

  assetsDraft: defineTable({
    author: v.id("users"),
    publicId: v.string(),
    assetType: v.string(),
  })
    .index("by_author", ["author"])
    .index("by_publicId", ["publicId"]),

  comments: defineTable({
    author: v.id("users"),
    post: v.id("posts"),
    content: v.string(),
    likes: v.array(v.id("users")),
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
    read: v.optional(v.boolean()),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
    ),
  }).index("by_conversation", ["conversation"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  subscriptions: defineTable({
    startDate: v.number(),
    endDate: v.number(),
    serviceType: v.string(),
    amountPaid: v.number(),
    subscriber: v.id("users"),
    creator: v.id("users"),
    status: v.string(),
    transactionId: v.optional(v.string()),
    renewalCount: v.number(),
    lastUpdateTime: v.number(),
  })
    .index("by_subscriber", ["subscriber"])
    .index("by_creator", ["creator"])
    .index("by_creator_subscriber", ["creator", "subscriber"])
    .index("by_status", ["status"])
    .index("by_endDate", ["endDate"]),

  notifications: defineTable({
    type: v.string(),
    recipientId: v.id("users"),
    sender: v.id("users"),
    read: v.boolean(),
    post: v.optional(v.id("posts")),
    comment: v.optional(v.id("comments")),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_type_post_sender", ["type", "post", "sender"])
    .index("by_type_comment_sender", ["type", "comment", "sender"]),

  blocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
  })
    .index("by_blocker", ["blockerId"])
    .index("by_blocked", ["blockedId"])
    .index("by_blocker_blocked", ["blockerId", "blockedId"]),
})
