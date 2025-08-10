import { ConvexError, v } from "convex/values"
import { addDays } from "date-fns"
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server"

export const canUserSubscribe = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId)

    if (!creator) {
      return {
        canSubscribe: false,
        reason: "Creator not found",
        message: "Cet utilisateur n'existe pas",
      }
    }

    if (creator.accountType === "USER") {
      return {
        canSubscribe: false,
        reason: "User is not a creator",
        message: "Cet utilisateur n'est pas un créateur",
      }
    }

    if (creator.creatorApplicationStatus !== "approved") {
      return {
        canSubscribe: false,
        reason: "Creator application is not approved",
        message: "Ce créateur n'est pas encore approuvé",
      }
    }

    return {
      canSubscribe: true,
      reason: null,
      message: null,
    }
  },
})

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

      // Mettre à jour l'abonnement existant
      await ctx.db.patch(existingSubscription._id, {
        startDate: currentTime,
        endDate: endDate,
        status: "active",
        ...transactionUpdate,
        renewalCount: existingSubscription.renewalCount + 1,
        lastUpdateTime: currentTime,
        amountPaid: amount,
      })

      // CORRECTION : Vérifier si la relation follow existe, indépendamment du statut d'abonnement
      const existingFollow = await ctx.db
        .query("follows")
        .withIndex("by_follower_following", (q) =>
          q
            .eq("followerId", args.subscriberId)
            .eq("followingId", args.creatorId),
        )
        .unique()

      // Si la relation n'existe pas, la créer (même pour un renouvellement)
      if (!existingFollow) {
        await ctx.db.insert("follows", {
          followerId: args.subscriberId,
          followingId: args.creatorId,
          subscriptionId: existingSubscription._id,
        })
      }

      // Créer une notification appropriée
      await ctx.db.insert("notifications", {
        type: needsReactivation ? "newSubscription" : "renewSubscription",
        recipientId: args.creatorId,
        sender: args.subscriberId,
        read: false,
      })

      // Vérifier et supprimer tout blocage existant
      const blockFromSubscriber = await ctx.db
        .query("blocks")
        .withIndex("by_blocker_blocked", (q) =>
          q.eq("blockerId", args.subscriberId).eq("blockedId", args.creatorId),
        )
        .unique()

      if (blockFromSubscriber) {
        // L'abonné avait bloqué le créateur, supprimer ce blocage
        await ctx.db.delete(blockFromSubscriber._id)

        // Optionnel : Notifier l'abonné que le blocage a été levé
        // await ctx.db.insert("notifications", {
        //   type: "blockRemoved",
        //   recipientId: args.subscriberId,
        //   sender: args.creatorId,
        //   read: false,
        //   message: "Blocage automatiquement levé suite à votre abonnement",
        // })
      }

      // Vérifier également si le créateur avait bloqué l'abonné
      const blockFromCreator = await ctx.db
        .query("blocks")
        .withIndex("by_blocker_blocked", (q) =>
          q.eq("blockerId", args.creatorId).eq("blockedId", args.subscriberId),
        )
        .unique()

      if (blockFromCreator) {
        // Le créateur avait bloqué l'abonné, supprimer ce blocage
        await ctx.db.delete(blockFromCreator._id)

        // Optionnel : Notifier le créateur que le blocage a été levé
        // await ctx.db.insert("notifications", {
        //   type: "blockRemoved",
        //   recipientId: args.creatorId,
        //   sender: args.subscriberId,
        //   read: false,
        //   message: "Blocage automatiquement levé suite à un nouvel abonnement",
        // })
      }

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

      // CORRECTION : Utiliser withIndex avec by_follower_following au lieu de by_subscriptionId
      const follows = await ctx.db
        .query("follows")
        .withIndex("by_follower_following", (q) =>
          q
            .eq("followerId", subscription.subscriber)
            .eq("followingId", subscription.creator),
        )
        .collect()

      // Supprimer toutes les relations de suivi trouvées
      for (const follow of follows) {
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

export const getCurrentUserSubscriptions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new ConvexError("User not found")

    // Récupérer toutes les souscriptions où l'utilisateur est l'abonné
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriber", (q) => q.eq("subscriber", user._id))
      .collect()

    // Enrichir les résultats avec les informations des créateurs
    const subscriptionsWithCreators = await Promise.all(
      subscriptions.map(async (subscription) => {
        const creator = await ctx.db.get(subscription.creator)
        return {
          ...subscription,
          creatorDetails: creator,
        }
      }),
    )

    return subscriptionsWithCreators
  },
})
