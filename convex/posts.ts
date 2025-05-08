"use server"

import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createPost = mutation({
  args: {
    content: v.string(),
    medias: v.array(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
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
    if (post.author !== user._id)
      throw new ConvexError("User not authorized to delete this post")

    // Supprimer le post dans la database
    await ctx.db.delete(args.postId)

    // Supprimer toutes les notifications associées à ce post
    const existingNewPostNotification = await ctx.db
      .query("notifications")
      .withIndex("by_type_post_sender", (q) =>
        q.eq("type", "newPost").eq("post", args.postId).eq("sender", user._id),
      )
      .collect()
    for (const notification of existingNewPostNotification) {
      await ctx.db.delete(notification._id)
    }
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
