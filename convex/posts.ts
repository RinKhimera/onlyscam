import { ConvexError, v } from "convex/values"
import { api } from "./_generated/api"
import { mutation, query } from "./_generated/server"

export const createPost = mutation({
  args: {
    content: v.string(),
    medias: v.array(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
    visibility: v.union(v.literal("public"), v.literal("subscribers_only")),
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

    // Insérer le post dans la base de données
    const postId = await ctx.db.insert("posts", {
      author: user._id,
      content: args.content,
      medias: args.medias,
      likes: [],
      comments: [],
      visibility: args.visibility,
    })

    // Envoyer une notification à tous les followers
    const userFollowers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect()

    for (const follower of userFollowers) {
      await ctx.db.insert("notifications", {
        type: "newPost",
        recipientId: follower.followerId,
        sender: user._id,
        post: postId,
        read: false,
      })
    }
  },
})

export const deletePost = mutation({
  args: { postId: v.id("posts") },
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

    // Trouver le post à supprimer
    const post = await ctx.db
      .query("posts")
      .withIndex("by_id", (q) => q.eq("_id", args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    // Vérifier si l'utilisateur est autorisé à supprimer le post
    if (post.author !== user._id && user.accountType !== "SUPERUSER") {
      throw new ConvexError("User not authorized to delete this post")
    }

    // Supprimer les médias Cloudinary de manière asynchrone
    if (post.medias && post.medias.length > 0) {
      for (const mediaUrl of post.medias) {
        try {
          await ctx.scheduler.runAfter(
            0,
            api.internalActions.deleteCloudinaryAssetFromUrl,
            {
              url: mediaUrl,
            },
          )
        } catch (error) {
          console.error(
            `Failed to schedule deletion for media ${mediaUrl}:`,
            error,
          )
        }
      }
    }

    // Supprimer tous les commentaires associés au post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("post", args.postId))
      .collect()

    for (const comment of comments) {
      await ctx.db.delete(comment._id)
    }

    // Supprimer le post de tous les bookmarks
    const users = await ctx.db.query("users").collect()
    for (const userDoc of users) {
      if (userDoc.bookmarks?.includes(args.postId)) {
        await ctx.db.patch(userDoc._id, {
          bookmarks: userDoc.bookmarks.filter((id) => id !== args.postId),
        })
      }
    }

    // Supprimer toutes les notifications associées à ce post
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("post"), args.postId))
      .collect()

    for (const notification of notifications) {
      await ctx.db.delete(notification._id)
    }

    // Supprimer le post de la base de données
    await ctx.db.delete(args.postId)

    return { success: true }
  },
})

export const getPost = query({
  args: {
    // username: v.string(),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_id", (q) => q.eq("_id", args.postId))
      .unique()

    if (!post) return

    const author = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", post.author))
      .unique()

    if (!author) throw new ConvexError("Author not found")

    // if (author.username !== args.username)
    //   throw new ConvexError("Author does not match username")

    const postWithAuthor = {
      ...post,
      author,
    }

    return postWithAuthor
  },
})

export const getUserPosts = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.authorId))
      .unique()

    if (!author) throw new ConvexError("User not found")

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("author", author._id))
      .order("desc")
      .collect()

    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        // const author = await ctx.db
        //   .query("users")
        //   .filter((q) => q.eq(q.field("_id"), post.author))
        //   .unique()

        return {
          ...post,
          author,
        }
      }),
    )

    return postsWithAuthor
  },
})

export const getUserGallery = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("author", args.authorId))
      .order("desc")
      .collect()

    // Filtrer les posts qui ont au moins un média
    const postsWithMedia = posts.filter(
      (post) => post.medias && post.medias.length > 0,
    )

    // Aplatir tous les médias en éléments individuels de galerie
    const galleryItems: Array<{
      _id: string
      mediaUrl: string
      visibility: string
    }> = []

    postsWithMedia.forEach((post) => {
      post.medias?.forEach((mediaUrl, index) => {
        galleryItems.push({
          _id: `${post._id}_${index}`,
          mediaUrl,
          visibility: post.visibility || "public",
        })
      })
    })

    return galleryItems
  },
})

export const getUserBookmark = query({
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

    const bookmarksWithAuthor = await Promise.all(
      user.bookmarks?.map(async (bookmark) => {
        const post = await ctx.db
          .query("posts")
          .withIndex("by_id", (q) => q.eq("_id", bookmark))
          .unique()

        if (!post) return null

        const author = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("_id", post.author))
          .unique()

        return {
          ...post,
          author,
        }
      }) || [],
    )

    return bookmarksWithAuthor
  },
})

export const getAllPosts = query({
  args: {},
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").order("desc").take(100)

    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), post.author))
          .unique()

        return {
          ...post,
          author,
        }
      }),
    )

    return postsWithAuthor
  },
})

export const getHomePosts = query({
  args: {
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.currentUserId))
      .unique()

    if (!currentUser) throw new ConvexError("User not found")

    // Si l'utilisateur est un superuser, retourner tous les posts
    if (currentUser.accountType === "SUPERUSER") {
      const allPosts = await ctx.db.query("posts").order("desc").take(100)

      const postsWithAuthor = await Promise.all(
        allPosts.map(async (post) => {
          const author = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), post.author))
            .unique()

          return {
            ...post,
            author,
          }
        }),
      )

      return postsWithAuthor
    }

    // Pour les utilisateurs normaux:
    // 1. Récupérer tous les utilisateurs que l'utilisateur courant suit avec une souscription active
    const activeSubscriptions = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.currentUserId))
      .collect()

    // Créer un Set pour une recherche efficace
    const followedCreatorsWithSubs = new Set()

    // Vérifier quelles souscriptions sont actives
    for (const follow of activeSubscriptions) {
      const subscription = await ctx.db.get(follow.subscriptionId)
      if (subscription && subscription.status === "active") {
        followedCreatorsWithSubs.add(follow.followingId)
      }
    }

    // 2. Récupérer tous les posts (limités à 100 pour des raisons de performance)
    const posts = await ctx.db.query("posts").order("desc").take(100)

    // 3. Filtrer les posts en fonction de la visibilité
    const filteredPosts = posts.filter((post) => {
      // Inclure tous les posts publics
      if (!post.visibility || post.visibility === "public") {
        return true
      }

      // Inclure les posts privés des créateurs que l'utilisateur suit avec un abonnement actif
      if (
        post.visibility === "subscribers_only" &&
        followedCreatorsWithSubs.has(post.author)
      ) {
        return true
      }

      // Inclure les posts privés de l'utilisateur lui-même
      if (
        post.visibility === "subscribers_only" &&
        post.author === args.currentUserId
      ) {
        return true
      }

      return false
    })

    // 4. Ajouter les informations d'auteur à chaque post
    const postsWithAuthor = await Promise.all(
      filteredPosts.map(async (post) => {
        const author = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), post.author))
          .unique()

        return {
          ...post,
          author,
        }
      }),
    )

    return postsWithAuthor
  },
})

export const likePost = mutation({
  args: { postId: v.id("posts") },
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

    // Trouver le post à liker
    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    // Vérifier l'accès au contenu restreint
    if (post.visibility === "subscribers_only" && post.author !== user._id) {
      const subscription = await ctx.db
        .query("follows")
        .withIndex("by_follower_following", (q) =>
          q.eq("followerId", user._id).eq("followingId", post.author),
        )
        .unique()

      if (!subscription) {
        throw new ConvexError("Access denied: subscription required")
      }

      const subscriptionDetails = await ctx.db.get(subscription.subscriptionId)
      if (!subscriptionDetails || subscriptionDetails.status !== "active") {
        throw new ConvexError("Access denied: active subscription required")
      }
    }

    // Ajouter l'utilisateur à la liste des likes
    await ctx.db.patch(args.postId, {
      likes: [...(post.likes || []), user._id],
    })

    // Envoyer une notification au propriétaire du post
    if (post.author !== user._id) {
      await ctx.db.insert("notifications", {
        type: "like",
        recipientId: post.author,
        sender: user._id,
        post: args.postId,
        read: false,
      })
    }
  },
})

export const unlikePost = mutation({
  args: { postId: v.id("posts") },
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

    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    // Supprimer l'utilisateur de la liste des likes
    await ctx.db.patch(args.postId, {
      likes: post.likes?.filter((id) => id !== user._id) || [],
    })

    // Supprimer la notification de like s'il existe
    const existingLikeNotification = await ctx.db
      .query("notifications")
      .withIndex("by_type_post_sender", (q) =>
        q.eq("type", "like").eq("post", args.postId).eq("sender", user._id),
      )
      .unique()

    if (existingLikeNotification !== null) {
      await ctx.db.delete(existingLikeNotification._id)
    }
  },
})

export const addBookmark = mutation({
  args: { postId: v.id("posts") },
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

    if (!user.bookmarks?.includes(args.postId)) {
      await ctx.db.patch(user._id, {
        bookmarks: [args.postId, ...(user.bookmarks || [])],
      })
    }
  },
})

export const removeBookmark = mutation({
  args: { postId: v.id("posts") },
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

    await ctx.db.patch(user._id, {
      bookmarks: user.bookmarks?.filter((id) => id !== args.postId) || [],
    })
  },
})

export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
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

    // Récupérer le post
    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError("Post not found")

    // Vérifier que l'utilisateur est bien l'auteur
    if (post.author !== user._id) throw new ConvexError("Unauthorized")

    // Mettre à jour le contenu du post
    await ctx.db.patch(args.postId, {
      content: args.content,
    })

    return { success: true }
  },
})

export const updatePostVisibility = mutation({
  args: {
    postId: v.id("posts"),
    visibility: v.union(v.literal("public"), v.literal("subscribers_only")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new Error("User not found")

    // Récupérer le post
    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error("Post not found")

    // Vérifier que l'utilisateur est bien l'auteur
    if (post.author !== user._id) throw new Error("Unauthorized")

    // Mettre à jour la visibilité du post
    await ctx.db.patch(args.postId, {
      visibility: args.visibility,
    })

    return { success: true }
  },
})
