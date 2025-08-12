import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Créer un signalement
export const createReport = mutation({
  args: {
    reportedUserId: v.optional(v.id("users")),
    reportedPostId: v.optional(v.id("posts")),
    reportedCommentId: v.optional(v.id("comments")),
    type: v.union(v.literal("user"), v.literal("post"), v.literal("comment")),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("inappropriate_content"),
      v.literal("fake_account"),
      v.literal("copyright"),
      v.literal("violence"),
      v.literal("hate_speech"),
      v.literal("other"),
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser) throw new Error("User not found")

    // Vérifier qu'il y a soit un utilisateur, soit un post, soit un commentaire signalé
    if (
      !args.reportedUserId &&
      !args.reportedPostId &&
      !args.reportedCommentId
    ) {
      throw new Error("Must report either a user, a post, or a comment")
    }

    // Vérifier que l'utilisateur ne signale pas lui-même
    if (args.reportedUserId === currentUser._id) {
      throw new Error("Cannot report yourself")
    }

    // Vérifier que l'utilisateur ne signale pas son propre contenu
    if (args.reportedPostId) {
      const post = await ctx.db.get(args.reportedPostId)
      if (post && post.author === currentUser._id) {
        throw new Error("Cannot report your own post")
      }
    }

    if (args.reportedCommentId) {
      const comment = await ctx.db.get(args.reportedCommentId)
      if (comment && comment.author === currentUser._id) {
        throw new Error("Cannot report your own comment")
      }
    }

    await ctx.db.insert("reports", {
      reporterId: currentUser._id,
      reportedUserId: args.reportedUserId,
      reportedPostId: args.reportedPostId,
      reportedCommentId: args.reportedCommentId,
      type: args.type,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

// Récupérer tous les signalements (Admin seulement)
export const getAllReports = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser || currentUser.accountType !== "SUPERUSER") {
      throw new Error("Unauthorized")
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_created_at")
      .order("desc")
      .collect()

    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reporterId)

        let reportedUser = null
        if (report.reportedUserId) {
          reportedUser = await ctx.db.get(report.reportedUserId)
        }

        let reportedPost = null
        if (report.reportedPostId) {
          reportedPost = await ctx.db.get(report.reportedPostId)
          if (reportedPost) {
            const postAuthor = await ctx.db.get(reportedPost.author)
            reportedPost = { ...reportedPost, author: postAuthor }
          }
        }

        let reportedComment = null
        if (report.reportedCommentId) {
          reportedComment = await ctx.db.get(report.reportedCommentId)
          if (reportedComment) {
            const commentAuthor = await ctx.db.get(reportedComment.author)
            const commentPost = await ctx.db.get(reportedComment.post)
            reportedComment = {
              ...reportedComment,
              author: commentAuthor,
              post: commentPost,
            }
          }
        }

        let reviewedBy = null
        if (report.reviewedBy) {
          reviewedBy = await ctx.db.get(report.reviewedBy)
        }

        return {
          ...report,
          reporter,
          reportedUser,
          reportedPost,
          reportedComment,
          reviewedByUser: reviewedBy,
        }
      }),
    )

    return enrichedReports
  },
})

// Mettre à jour le statut d'un signalement
export const updateReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("rejected"),
    ),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser || currentUser.accountType !== "SUPERUSER") {
      throw new Error("Unauthorized")
    }

    await ctx.db.patch(args.reportId, {
      status: args.status,
      adminNotes: args.adminNotes,
      reviewedBy: currentUser._id,
      reviewedAt: Date.now(),
    })

    return { success: true }
  },
})

// Récupérer les statistiques des signalements
export const getReportsStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser || currentUser.accountType !== "SUPERUSER") {
      throw new Error("Unauthorized")
    }

    const allReports = await ctx.db.query("reports").collect()

    const stats = {
      total: allReports.length,
      pending: allReports.filter((r) => r.status === "pending").length,
      reviewing: allReports.filter((r) => r.status === "reviewing").length,
      resolved: allReports.filter((r) => r.status === "resolved").length,
      rejected: allReports.filter((r) => r.status === "rejected").length,
      userReports: allReports.filter((r) => r.type === "user").length,
      postReports: allReports.filter((r) => r.type === "post").length,
      commentReports: allReports.filter((r) => r.type === "comment").length,
    }

    return stats
  },
})

// Récupérer un signalement par ID
export const getReportById = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser || currentUser.accountType !== "SUPERUSER") {
      throw new Error("Unauthorized")
    }

    const report = await ctx.db.get(args.reportId)
    if (!report) return null

    const reporter = await ctx.db.get(report.reporterId)

    let reportedUser = null
    if (report.reportedUserId) {
      reportedUser = await ctx.db.get(report.reportedUserId)
    }

    let reportedPost = null
    if (report.reportedPostId) {
      reportedPost = await ctx.db.get(report.reportedPostId)
      if (reportedPost) {
        const postAuthor = await ctx.db.get(reportedPost.author)
        reportedPost = { ...reportedPost, author: postAuthor }
      }
    }

    let reportedComment = null
    if (report.reportedCommentId) {
      reportedComment = await ctx.db.get(report.reportedCommentId)
      if (reportedComment) {
        const commentAuthor = await ctx.db.get(reportedComment.author)
        const commentPost = await ctx.db.get(reportedComment.post)
        reportedComment = {
          ...reportedComment,
          author: commentAuthor,
          post: commentPost,
        }
      }
    }

    let reviewedBy = null
    if (report.reviewedBy) {
      reviewedBy = await ctx.db.get(report.reviewedBy)
    }

    return {
      ...report,
      reporter,
      reportedUser,
      reportedPost,
      reportedComment,
      reviewedByUser: reviewedBy,
    }
  },
})

// Supprimer le contenu signalé et résoudre le signalement
export const deleteReportedContentAndResolve = mutation({
  args: {
    reportId: v.id("reports"),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!currentUser || currentUser.accountType !== "SUPERUSER") {
      throw new Error("Unauthorized")
    }

    const report = await ctx.db.get(args.reportId)
    if (!report) throw new Error("Report not found")

    // Supprimer le contenu selon le type
    if (report.type === "post" && report.reportedPostId) {
      const post = await ctx.db.get(report.reportedPostId)
      if (post) {
        // Supprimer tous les commentaires associés
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("post", report.reportedPostId!))
          .collect()

        for (const comment of comments) {
          await ctx.db.delete(comment._id)
        }

        // Supprimer le post des bookmarks
        const users = await ctx.db.query("users").collect()
        for (const user of users) {
          if (user.bookmarks?.includes(report.reportedPostId)) {
            await ctx.db.patch(user._id, {
              bookmarks: user.bookmarks.filter(
                (id) => id !== report.reportedPostId,
              ),
            })
          }
        }

        // Supprimer les notifications associées
        const notifications = await ctx.db
          .query("notifications")
          .filter((q) => q.eq(q.field("post"), report.reportedPostId))
          .collect()

        for (const notification of notifications) {
          await ctx.db.delete(notification._id)
        }

        // Supprimer le post
        await ctx.db.delete(report.reportedPostId)
      }
    } else if (report.type === "comment" && report.reportedCommentId) {
      const comment = await ctx.db.get(report.reportedCommentId)
      if (comment) {
        // Supprimer le commentaire des notifications associées
        const notifications = await ctx.db
          .query("notifications")
          .filter((q) => q.eq(q.field("comment"), report.reportedCommentId))
          .collect()

        for (const notification of notifications) {
          await ctx.db.delete(notification._id)
        }

        // Retirer le commentaire de la liste des commentaires du post parent
        const parentPost = await ctx.db.get(comment.post)
        if (parentPost) {
          await ctx.db.patch(comment.post, {
            comments: parentPost.comments.filter(
              (id) => id !== report.reportedCommentId,
            ),
          })
        }

        // Supprimer le commentaire
        await ctx.db.delete(report.reportedCommentId)
      }
    }

    // Marquer le signalement comme résolu
    await ctx.db.patch(args.reportId, {
      status: "resolved",
      adminNotes: args.adminNotes,
      reviewedBy: currentUser._id,
      reviewedAt: Date.now(),
    })

    return { success: true }
  },
})
