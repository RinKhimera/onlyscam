import { ConvexError, v } from "convex/values"
import { query } from "./_generated/server"

export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect()

    return followers
  },
})

export const getFollowings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect()

    return following
  },
})

export const getCurrentUserFollowers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    // Récupérer toutes les relations où l'utilisateur est suivi
    const followRelations = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect()

    // Récupérer les détails des abonnés et des abonnements associés
    const followers = await Promise.all(
      followRelations.map(async (follow) => {
        const follower = await ctx.db.get(follow.followerId)
        const subscription = await ctx.db.get(follow.subscriptionId)

        return {
          follow,
          followerDetails: follower,
          subscriptionDetails: subscription,
        }
      }),
    )

    return followers
  },
})

export const getCurrentUserFollowings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    // Récupérer toutes les relations où l'utilisateur est le follower
    const followingRelations = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect()

    // Récupérer les détails des utilisateurs suivis et des abonnements associés
    const followings = await Promise.all(
      followingRelations.map(async (follow) => {
        const following = await ctx.db.get(follow.followingId)
        const subscription = await ctx.db.get(follow.subscriptionId)

        return {
          follow,
          followingDetails: following,
          subscriptionDetails: subscription,
        }
      }),
    )

    return followings
  },
})

export const getPostsFromFollowedUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    // 1. Récupérer tous les utilisateurs que le currentUser suit
    const followingRelations = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect()

    // Si l'utilisateur ne suit personne, retourner un tableau vide
    if (followingRelations.length === 0) {
      return []
    }

    // 2. Extraire les IDs des utilisateurs suivis
    const followingIds = followingRelations.map(
      (relation) => relation.followingId,
    )

    // 3. Récupérer tous les posts des utilisateurs suivis
    const allPosts = []

    for (const followingId of followingIds) {
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_author", (q) => q.eq("author", followingId))
        .order("desc") // Les posts les plus récents d'abord
        .collect()

      // 4. Pour chaque post, récupérer les détails de l'auteur
      const postsWithAuthor = await Promise.all(
        posts.map(async (post) => {
          const author = await ctx.db.get(post.author)
          return {
            ...post,
            authorDetails: author,
          }
        }),
      )

      allPosts.push(...postsWithAuthor)
    }

    // 5. Trier tous les posts par date de création (du plus récent au plus ancien)
    allPosts.sort((a, b) => b._creationTime - a._creationTime)

    return allPosts
  },
})

export const getPostsFromFollowers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    // 1. Récupérer tous les utilisateurs qui suivent le currentUser
    const followerRelations = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect()

    // Si personne ne suit l'utilisateur, retourner un tableau vide
    if (followerRelations.length === 0) {
      return []
    }

    // 2. Extraire les IDs des followers
    const followerIds = followerRelations.map((relation) => relation.followerId)

    // 3. Récupérer tous les posts des followers
    const allPosts = []

    for (const followerId of followerIds) {
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_author", (q) => q.eq("author", followerId))
        .order("desc") // Les posts les plus récents d'abord
        .collect()

      // 4. Pour chaque post, récupérer les détails de l'auteur
      const postsWithAuthor = await Promise.all(
        posts.map(async (post) => {
          const author = await ctx.db.get(post.author)
          return {
            ...post,
            authorDetails: author,
          }
        }),
      )

      allPosts.push(...postsWithAuthor)
    }

    // 5. Trier tous les posts par date de création (du plus récent au plus ancien)
    allPosts.sort((a, b) => b._creationTime - a._creationTime)

    return allPosts
  },
})
