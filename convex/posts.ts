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

export const getUserPosts = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Unauthorized")

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
