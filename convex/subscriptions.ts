"use server"

import { ConvexError, v } from "convex/values"
import { addDays, isAfter, parseISO } from "date-fns"
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server"

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

export const followUser = internalMutation({
  args: {
    creatorId: v.id("users"),
    subscriberId: v.id("users"),
    startDate: v.string(),
    transactionId: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now()
    const amount = args.amountPaid ?? 1000
    const startDate = currentTime
    const endDate = addDays(new Date(startDate), 30).getTime()

    // Vérifie si un abonnement avec les mêmes détails existe
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", args.creatorId).eq("subscriber", args.subscriberId),
      )
      .filter((q) => q.eq(q.field("serviceType"), "follow"))
      .unique()

    // Si l'abonnement existe
    if (existingSubscription) {
      // Vérifier si l'abonnement est expiré ou annulé
      const needsReactivation = ["expired", "cancelled"].includes(
        existingSubscription.status,
      )

      // Si l'ID de transaction est fourni, on le met à jour
      const transactionUpdate = args.transactionId
        ? { transactionId: args.transactionId }
        : {}

      await ctx.db.patch(existingSubscription._id, {
        startDate: currentTime,
        endDate: endDate,
        status: "active",
        ...transactionUpdate,
        renewalCount: existingSubscription.renewalCount + 1,
        lastUpdateTime: currentTime,
        amountPaid: amount,
      })

      // Si l'abonnement était expiré ou annulé, on doit recréer la relation follows
      if (needsReactivation) {
        // Vérifier si la relation follow existe déjà
        const existingFollow = await ctx.db
          .query("follows")
          .withIndex("by_subscriptionId", (q) =>
            q.eq("subscriptionId", existingSubscription._id),
          )
          .unique()

        if (!existingFollow) {
          // Recréer la relation follow
          await ctx.db.insert("follows", {
            followerId: args.subscriberId,
            followingId: args.creatorId,
            subscriptionId: existingSubscription._id,
          })
        }
      }

      // Créer une notification appropriée
      await ctx.db.insert("notifications", {
        type: needsReactivation ? "newSubscription" : "renewSubscription",
        recipientId: args.creatorId,
        sender: args.subscriberId,
        read: false,
      })

      return {
        subscriptionId: existingSubscription._id,
        renewed: !needsReactivation,
        reactivated: needsReactivation,
      }
    } else {
      // Si l'abonnement n'existe pas, le crée
      const newSubscription = await ctx.db.insert("subscriptions", {
        startDate: startDate,
        endDate: endDate,
        serviceType: "follow",
        amountPaid: amount,
        subscriber: args.subscriberId,
        creator: args.creatorId,
        status: "active",
        transactionId: args.transactionId,
        renewalCount: 0,
        lastUpdateTime: currentTime,
      })

      // Crée un suivi pour le nouvel abonnement
      await ctx.db.insert("follows", {
        followerId: args.subscriberId,
        followingId: args.creatorId,
        subscriptionId: newSubscription,
      })

      // Crée une notification pour le nouvel abonnement
      await ctx.db.insert("notifications", {
        type: "newSubscription",
        recipientId: args.creatorId,
        sender: args.subscriberId,
        read: false,
      })

      return {
        subscriptionId: newSubscription,
        renewed: false,
        reactivated: false,
      }
    }
  },
})

export const unfollowUser = mutation({
  args: {
    creatorId: v.id("users"),
    reason: v.optional(v.string()),
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

    const currentTime = Date.now()

    // Trouver l'abonnement à annuler
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_subscriber", (q) =>
        q.eq("creator", args.creatorId).eq("subscriber", user._id),
      )
      .filter((q) => q.eq(q.field("serviceType"), "follow"))
      .unique()

    // Vérifie si l'abonnement existe
    if (!subscription) throw new ConvexError("Subscription not found")

    // Au lieu de supprimer l'abonnement, marquer comme annulé
    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      lastUpdateTime: currentTime,
    })

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

    return { cancelled: true, subscriptionId: subscription._id }
  },
})

export const getSubscriptionHistory = query({
  args: {
    userId: v.id("users"),
    asCreator: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Si asCreator est true, cherche les abonnements où l'utilisateur est le créateur
    // Sinon, cherche les abonnements où l'utilisateur est l'abonné
    const field = args.asCreator ? "creator" : "subscriber"

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex(args.asCreator ? "by_creator" : "by_subscriber", (q) =>
        q.eq(field, args.userId),
      )
      .order("desc")
      .collect()

    return subscriptions
  },
})

export const getSubscriptionByTransactionId = internalQuery({
  args: { transactionId: v.string() },
  handler: async (ctx, args) => {
    // Recherche un abonnement avec cet ID de transaction
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .unique()

    return subscription
  },
})

export const checkAndUpdateExpiredSubscriptions = internalMutation({
  handler: async (ctx) => {
    const currentTime = Date.now()

    // Récupérer tous les abonnements actifs qui sont expirés
    const expiredSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.lt(q.field("endDate"), currentTime))
      .collect()

    // Compteurs pour le rapport
    const updates = {
      processed: 0,
      followsRemoved: 0,
      notificationsSent: 0,
    }

    // Mettre à jour tous les abonnements expirés
    for (const subscription of expiredSubscriptions) {
      // Mettre à jour le statut de l'abonnement
      await ctx.db.patch(subscription._id, {
        status: "expired",
        lastUpdateTime: currentTime,
      })

      // Supprimer les relations follows associées
      const follow = await ctx.db
        .query("follows")
        .withIndex("by_subscriptionId", (q) =>
          q.eq("subscriptionId", subscription._id),
        )
        .unique()

      if (follow) {
        await ctx.db.delete(follow._id)
        updates.followsRemoved++
      }

      // Option: Envoyer une notification au créateur et à l'abonné
      await ctx.db.insert("notifications", {
        type: "subscriptionExpired",
        recipientId: subscription.creator,
        sender: subscription.subscriber,
        read: false,
      })

      updates.notificationsSent++
      updates.processed++
    }

    return {
      processedCount: updates.processed,
      followsRemoved: updates.followsRemoved,
      notificationsSent: updates.notificationsSent,
    }
  },
})
