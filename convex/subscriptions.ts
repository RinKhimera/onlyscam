"use server"

import { ConvexError, v } from "convex/values"
import { addDays, isAfter, parseISO } from "date-fns"
import { mutation, query } from "./_generated/server"

export const getFollowSubscription = query({
  args: { creatorId: v.id("users"), subscriberId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", args.creatorId).eq("subscriber", args.subscriberId),
      )
      .filter((q) => q.eq(q.field("serviceType"), "follow"))
      .unique()

    return subscription
  },
})

export const followUser = mutation({
  args: {
    creatorId: v.id("users"),
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const startDate = parseISO(args.startDate).getTime()
    const endDate = addDays(args.startDate, 30).getTime()

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    // Vérifie si un abonnement avec les mêmes détails existe
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", args.creatorId).eq("subscriber", user._id),
      )
      .filter((q) => q.eq(q.field("serviceType"), "follow"))
      .unique()

    // Si l'abonnement existe, le renouvelle
    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        endDate: endDate,
      })

      // TODO : Fix l'empêchement de la notif en cas de trigger outdaté

      // Crée une notification pour le renouvellement de l'abonnement
      await ctx.db.insert("notifications", {
        type: "renewSubscription",
        recipientId: args.creatorId,
        sender: user._id,
        // post: args.postId,
        read: false,
      })
    }

    // Si l'abonnement n'existe pas, le crée
    if (!existingSubscription) {
      const newSubscription = await ctx.db.insert("subscriptions", {
        startDate: startDate,
        endDate: endDate,
        serviceType: "follow",
        amountPaid: 500,
        subscriber: user._id,
        creator: args.creatorId,
      })

      // Crée un suivi pour le nouvel abonnement
      await ctx.db.insert("follows", {
        followerId: user._id,
        followingId: args.creatorId,
        subscriptionId: newSubscription,
      })

      // Crée une notification pour le nouvel abonnement
      await ctx.db.insert("notifications", {
        type: "newSubscription",
        recipientId: args.creatorId,
        sender: user._id,
        // post: args.postId,
        read: false,
      })
    }
  },
})

export const unfollowUser = mutation({
  args: { creatorId: v.id("users") },
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

    // Trouver l'abonnement actif à annuler
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", args.creatorId).eq("subscriber", user._id),
      )
      .filter((q) => q.eq(q.field("serviceType"), "follow"))
      .unique()

    // Vérifie si l'abonnement existe
    if (!subscription) throw new ConvexError("Subscription not found")

    // Vérifie si l'abonnement est actif
    if (!isAfter(subscription.endDate, Date.now())) {
      throw new ConvexError("Subscription is not active")
    }

    // Termine l'abonnement immédiatement en le supprimant
    await ctx.db.delete(subscription._id)

    // Supprime le suivi associé à l'abonnement
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_subscriptionId", (q) =>
        q.eq("subscriptionId", subscription._id),
      )
      .unique()

    if (follow) {
      await ctx.db.delete(follow._id)
    }
  },
})
