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

    await ctx.db.insert("posts", {
      author: user._id,
      content: args.content,
      medias: args.medias,
      likes: [],
      comments: [],
    })
  },
})

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
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

    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) {
      throw new ConvexError("Post not found")
    }

    if (post.author !== user._id) {
      throw new ConvexError("Unauthorized")
    }

    await ctx.db.delete(args.postId)
  },
})

export const getUserPosts = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const author = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!author) throw new ConvexError("User not found")

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("author", author._id))
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
  args: {
    postId: v.id("posts"),
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

    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    await ctx.db.patch(args.postId, {
      likes: [...(post.likes || []), user._id],
    })
  },
})

export const unlikePost = mutation({
  args: {
    postId: v.id("posts"),
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

    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    await ctx.db.patch(args.postId, {
      likes: post.likes?.filter((id) => id !== user._id) || [],
    })
  },
})

export const addComment = mutation({
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

    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    await ctx.db.insert("comments", {
      author: user._id,
      post: args.postId,
      content: args.content,
      likes: [],
    })
  },
})

export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
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

    const comment = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("_id"), args.commentId))
      .unique()

    if (!comment) throw new ConvexError("Comment not found")

    if (comment.author !== user._id)
      throw new ConvexError("User not authorized to delete this comment")

    await ctx.db.delete(args.commentId)
  },
})
