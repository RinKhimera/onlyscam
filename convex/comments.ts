import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
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

    if (!user) throw new ConvexError("User not found")

    const postToComment = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!postToComment) throw new ConvexError("Post not found")

    const comment = await ctx.db.insert("comments", {
      author: user._id,
      post: args.postId,
      content: args.content,
      likes: [],
    })

    await ctx.db.patch(args.postId, {
      comments: [...(postToComment.comments || []), comment],
    })

    await ctx.db.insert("notifications", {
      type: "comment",
      recipientId: postToComment.author,
      sender: user._id,
      post: args.postId,
      read: false,
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
      .withIndex("by_id", (q) => q.eq("_id", args.commentId))
      .unique()

    if (!comment) throw new ConvexError("Comment not found")

    if (comment.author !== user._id)
      throw new ConvexError("User not authorized to delete this comment")

    const post = await ctx.db
      .query("posts")
      .withIndex("by_id", (q) => q.eq("_id", comment.post))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    await ctx.db.delete(args.commentId)

    await ctx.db.patch(comment.post, {
      comments: post.comments.filter((id) => id !== comment._id),
    })
  },
})

export const getPostComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const postComments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("post", args.postId))
      .order("desc")
      .collect()

    const commentsWithAuthor = await Promise.all(
      postComments.map(async (comment) => {
        const author = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("_id", comment.author))
          .unique()

        return {
          ...comment,
          author,
        }
      }),
    )

    return commentsWithAuthor
  },
})

export const likeComment = mutation({
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

    await ctx.db.patch(args.commentId, {
      likes: [...(comment.likes || []), user._id],
    })
  },
})

export const unlikeComment = mutation({
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

    await ctx.db.patch(args.commentId, {
      likes: comment.likes?.filter((id) => id !== user._id) || [],
    })
  },
})
