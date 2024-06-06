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
      .withIndex("by_id", (q) => q.eq("_id", args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    if (post.author !== user._id)
      throw new ConvexError("User not authorized to delete this post")

    await ctx.db.delete(args.postId)
  },
})

export const getPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .unique()

    if (!post) throw new ConvexError("Post not found")

    const author = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), post.author))
      .unique()

    if (!author) throw new ConvexError("Author not found")

    const postWithAuthor = {
      ...post,
      author,
    }

    return postWithAuthor
  },
})

export const getUserPosts = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
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

    await ctx.db.patch(args.postId, {
      likes: post.likes?.filter((id) => id !== user._id) || [],
    })
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

// export const addComment = mutation({
//   args: {
//     postId: v.id("posts"),
//     content: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity()
//     if (!identity) throw new ConvexError("Not authenticated")

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_tokenIdentifier", (q) =>
//         q.eq("tokenIdentifier", identity.tokenIdentifier),
//       )
//       .unique()

//     if (!user) throw new ConvexError("User not found")

//     const post = await ctx.db
//       .query("posts")
//       .filter((q) => q.eq(q.field("_id"), args.postId))
//       .unique()

//     if (!post) throw new ConvexError("Post not found")

//     await ctx.db.insert("comments", {
//       author: user._id,
//       post: args.postId,
//       content: args.content,
//       likes: [],
//     })
//   },
// })

// export const deleteComment = mutation({
//   args: {
//     commentId: v.id("comments"),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity()
//     if (!identity) throw new ConvexError("Not authenticated")

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_tokenIdentifier", (q) =>
//         q.eq("tokenIdentifier", identity.tokenIdentifier),
//       )
//       .unique()

//     if (!user) throw new ConvexError("User not found")

//     const comment = await ctx.db
//       .query("comments")
//       .filter((q) => q.eq(q.field("_id"), args.commentId))
//       .unique()

//     if (!comment) throw new ConvexError("Comment not found")

//     if (comment.author !== user._id)
//       throw new ConvexError("User not authorized to delete this comment")

//     await ctx.db.delete(args.commentId)
//   },
// })
