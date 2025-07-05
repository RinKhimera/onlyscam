import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Créer un signalement
export const createReport = mutation({
  args: {
    reportedUserId: v.optional(v.id("users")),
    reportedPostId: v.optional(v.id("posts")),
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

    // Vérifier qu'il y a soit un utilisateur signalé soit un post signalé
    if (!args.reportedUserId && !args.reportedPostId) {
      throw new Error("Must report either a user or a post")
    }

    // Vérifier que l'utilisateur ne signale pas lui-même
    if (args.reportedUserId === currentUser._id) {
      throw new Error("Cannot report yourself")
    }

    await ctx.db.insert("reports", {
      reporterId: currentUser._id,
      reportedUserId: args.reportedUserId,
      reportedPostId: args.reportedPostId,
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

        let reviewedBy = null
        if (report.reviewedBy) {
          reviewedBy = await ctx.db.get(report.reviewedBy)
        }

        return {
          ...report,
          reporter,
          reportedUser,
          reportedPost,
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
    }

    return stats
  },
})
