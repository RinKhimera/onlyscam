import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const submitApplication = mutation({
  args: {
    userId: v.id("users"),
    personalInfo: v.object({
      fullName: v.string(),
      dateOfBirth: v.string(),
      address: v.string(),
      phoneNumber: v.string(),
    }),
    applicationReason: v.string(),
    identityDocuments: v.array(
      v.object({
        type: v.union(
          v.literal("identity_card"),
          v.literal("passport"),
          v.literal("driving_license"),
          v.literal("selfie"),
        ),
        url: v.string(),
        publicId: v.string(),
        uploadedAt: v.number(),
      }),
    ),
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

    if (!currentUser || currentUser._id !== args.userId) {
      throw new Error("Unauthorized")
    }

    const existingApplication = await ctx.db
      .query("creatorApplications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .first()

    if (existingApplication) {
      throw new Error("Une candidature est déjà en cours")
    }

    // Créer la candidature
    await ctx.db.insert("creatorApplications", {
      userId: args.userId,
      status: "pending",
      personalInfo: args.personalInfo,
      applicationReason: args.applicationReason,
      identityDocuments: args.identityDocuments,
      submittedAt: Date.now(),
    })

    // Mettre à jour le statut utilisateur
    await ctx.db.patch(args.userId, {
      creatorApplicationStatus: "pending",
    })

    // Nettoyer les drafts pour ce user (les documents sont maintenant officiellement soumis)
    const userDrafts = await ctx.db
      .query("validationDocumentsDraft")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    for (const draft of userDrafts) {
      await ctx.db.delete(draft._id)
    }

    return { success: true }
  },
})

export const getUserApplication = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query("creatorApplications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first()
  },
})

// Admins
export const getAllApplications = query({
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

    const applications = await ctx.db
      .query("creatorApplications")
      .order("desc")
      .collect()

    const applicationsWithUsers = await Promise.all(
      applications.map(async (application) => {
        const user = await ctx.db.get(application.userId)
        return {
          ...application,
          user,
        }
      }),
    )

    return applicationsWithUsers
  },
})

export const getPendingApplications = query({
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

    const applications = await ctx.db
      .query("creatorApplications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect()

    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const user = await ctx.db.get(app.userId)
        return { ...app, user }
      }),
    )

    return enrichedApplications
  },
})

export const reviewApplication = mutation({
  args: {
    applicationId: v.id("creatorApplications"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
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

    const application = await ctx.db.get(args.applicationId)
    if (!application) throw new Error("Application not found")

    // Mettre à jour la candidature
    await ctx.db.patch(args.applicationId, {
      status: args.decision,
      adminNotes: args.adminNotes,
      reviewedAt: Date.now(),
    })

    // Si approuvé, mettre à niveau l'utilisateur
    if (args.decision === "approved") {
      await ctx.db.patch(application.userId, {
        accountType: "CREATOR",
        creatorApplicationStatus: "approved",
      })
    } else {
      await ctx.db.patch(application.userId, {
        accountType: "USER",
        creatorApplicationStatus: "rejected",
      })
    }

    return { success: true }
  },
})
