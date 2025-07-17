import { UserJSON } from "@clerk/backend"
import { ConvexError, Validator, v } from "convex/values"
import {
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server"

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique()
}

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // Vient de Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      externalId: data.id,
      tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${data.id}`,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email_addresses[0]?.email_address,
      image: data.image_url,
      accountType: "USER" as const,
      isOnline: true,
    }

    const user = await userByExternalId(ctx, data.id)
    if (user === null) {
      await ctx.db.insert("users", userAttributes)
    } else {
      await ctx.db.patch(user._id, userAttributes)
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId)

    if (user !== null) {
      await ctx.db.delete(user._id)
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      )
    }
  },
})

export const createUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
    externalId: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      externalId: args.externalId,
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      email: args.email,
      image: args.image,
      imageBanner:
        "https://res.cloudinary.com/onlyscam/image/upload/v1745084406/banner-profile/placeholder.jpg",
      accountType: "USER",
      isOnline: true,
    })
  },
})

// export const updateUser = internalMutation({
//   args: { tokenIdentifier: v.string(), image: v.string() },
//   async handler(ctx, args) {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_tokenIdentifier", (q) =>
//         q.eq("tokenIdentifier", args.tokenIdentifier),
//       )
//       .unique()

//     if (!user) {
//       throw new ConvexError("User not found")
//     }

//     await ctx.db.patch(user._id, {
//       image: args.image,
//     })
//   },
// })

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()
  },
})

export const getUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Not authenticated")
    }

    const users = await ctx.db.query("users").collect()

    // return all users without the current user
    return users.filter(
      (user) => user.tokenIdentifier !== identity.tokenIdentifier,
    )
  },
})

export const setUserOnline = internalMutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (query) =>
        query.eq("tokenIdentifier", args.tokenIdentifier),
      )
      .unique()

    if (!user) {
      throw new ConvexError("User not found")
    }

    await ctx.db.patch(user._id, { isOnline: true })
  },
})

export const setUserOffline = internalMutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (query) =>
        query.eq("tokenIdentifier", args.tokenIdentifier),
      )
      .unique()

    if (!user) {
      throw new ConvexError("User not found")
    }

    await ctx.db.patch(user._id, { isOnline: false })
  },
})

export const getUserProfile = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique()

    return user
  },
})

export const updateUserProfile = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    bio: v.string(),
    location: v.string(),
    socials: v.array(v.string()),
    tokenIdentifier: v.string(),
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

    await ctx.db.patch(user._id, {
      name: args.name,
      username: args.username,
      // image: args.image,
      // imageBanner: args.imageBanner,
      bio: args.bio,
      location: args.location,
      socials: args.socials,
    })
  },
})

export const updateProfileImage = mutation({
  args: {
    imgUrl: v.string(),
    tokenIdentifier: v.string(),
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

    await ctx.db.patch(user._id, {
      image: args.imgUrl,
    })
  },
})

export const updateBannerImage = mutation({
  args: {
    bannerUrl: v.string(),
    tokenIdentifier: v.string(),
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

    await ctx.db.patch(user._id, {
      imageBanner: args.bannerUrl,
    })
  },
})

export const getAvailableUsername = query({
  args: {
    username: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .filter((q) => q.neq(q.field("tokenIdentifier"), args.tokenIdentifier))
      .unique()

    return !existingUsername
  },
})

export const upgradeToCreator = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser || currentUser._id !== args.userId) {
      throw new Error("Unauthorized")
    }

    if (
      currentUser.accountType === "CREATOR" ||
      currentUser.accountType === "SUPERUSER"
    ) {
      throw new Error("User is already a creator")
    }

    await ctx.db.patch(args.userId, {
      accountType: "CREATOR",
    })

    return { success: true }
  },
})

export const searchUsers = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser) return []

    // Récupérer tous les utilisateurs (sauf l'utilisateur actuel)
    const allUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.neq(q.field("_id"), currentUser._id),
          q.neq(q.field("username"), undefined),
        ),
      )
      .collect()

    // Recherche flexible (contient le terme)
    const searchTermLower = args.searchTerm.toLowerCase()
    const filteredUsers = allUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTermLower) ||
        user.username?.toLowerCase().includes(searchTermLower),
    )

    // Limiter à 10 résultats
    return filteredUsers.slice(0, 10)
  },
})
