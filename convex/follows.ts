import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

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

export const blockUser = mutation({
  args: {
    blockedUserId: v.id("users"),
  },
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

    // Vérifier si l'utilisateur existe déjà dans la liste des bloqués
    const existingBlock = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.blockedUserId),
      )
      .unique()

    if (existingBlock) {
      return { success: false, message: "User already blocked" }
    }

    // Ajouter l'utilisateur à la liste des bloqués
    const blockId = await ctx.db.insert("blocks", {
      blockerId: user._id,
      blockedId: args.blockedUserId,
    })

    // Vérifier s'il existe un abonnement de l'utilisateur courant vers l'utilisateur bloqué
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", args.blockedUserId).eq("subscriber", user._id),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceType"), "follow"),
          q.eq(q.field("status"), "active"),
        ),
      )
      .unique()

    // Si un abonnement actif existe, le marquer comme annulé
    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "cancelled",
        lastUpdateTime: Date.now(),
      })
    }

    // Vérifier également l'abonnement dans l'autre sens
    const reverseSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", user._id).eq("subscriber", args.blockedUserId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceType"), "follow"),
          q.eq(q.field("status"), "active"),
        ),
      )
      .unique()

    // Si un abonnement actif existe, le marquer comme annulé
    if (reverseSubscription) {
      await ctx.db.patch(reverseSubscription._id, {
        status: "cancelled",
        lastUpdateTime: Date.now(),
      })
    }

    // Si l'utilisateur bloqué suivait l'utilisateur actuel, supprimer cette relation
    const followRelation = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.blockedUserId).eq("followingId", user._id),
      )
      .unique()

    if (followRelation) {
      await ctx.db.delete(followRelation._id)
    }

    // Si l'utilisateur actuel suivait l'utilisateur bloqué, supprimer cette relation
    const followingRelation = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", user._id).eq("followingId", args.blockedUserId),
      )
      .unique()

    if (followingRelation) {
      await ctx.db.delete(followingRelation._id)
    }

    return { success: true, blockId }
  },
})

export const unblockUser = mutation({
  args: {
    blockedUserId: v.id("users"),
  },
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

    // Trouver l'entrée de blocage à supprimer
    const blockRelation = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.blockedUserId),
      )
      .unique()

    if (!blockRelation) {
      return { success: false, message: "Block relation not found" }
    }

    // Supprimer l'entrée de blocage
    await ctx.db.delete(blockRelation._id)
    return { success: true }
  },
})

export const getCurrentUserBlockedUsers = query({
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

    // Récupérer toutes les relations de blocage où l'utilisateur est le bloqueur
    const blockRelations = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", user._id))
      .collect()

    // Récupérer les détails des utilisateurs bloqués
    const blockedUsers = await Promise.all(
      blockRelations.map(async (block) => {
        const blockedUser = await ctx.db.get(block.blockedId)

        return {
          block,
          blockedUserDetails: blockedUser,
        }
      }),
    )

    return blockedUsers
  },
})

export const isUserBlocked = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return false // Non authentifié = non bloqué

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return false

    // Vérifier si l'utilisateur actuel a bloqué l'utilisateur spécifié
    const blockFromMe = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.userId),
      )
      .unique()

    // Vérifier si l'utilisateur spécifié a bloqué l'utilisateur actuel
    const blockFromThem = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", args.userId).eq("blockedId", user._id),
      )
      .unique()

    return {
      iBlockedThem: !!blockFromMe,
      theyBlockedMe: !!blockFromThem,
      isBlocked: !!blockFromMe || !!blockFromThem,
    }
  },
})
