import { action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { Doc, Id } from "./_generated/dataModel"

// Définir un type pour la réponse de l'action
type ProcessPaymentResult = {
  success: boolean
  message: string
  subscriptionId: Id<"subscriptions">
  status?: string
  alreadyExists?: boolean
  renewed?: boolean
  reactivated?: boolean
}

type CheckTransactionResult = {
  exists: boolean
  transactionId: string
  subscriptionId?: Id<"subscriptions">
  status?: string
  details?: {
    creator?: Id<"users">
    subscriber?: Id<"users">
    startDate?: number
    endDate?: number
    amountPaid?: number
  }
}

export const processPayment = action({
  args: {
    transactionId: v.string(),
    creatorId: v.id("users"),
    subscriberId: v.id("users"),
    startDate: v.string(),
    amountPaid: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<ProcessPaymentResult> => {
    // Vérifie d'abord si cette transaction existe déjà
    const subscription: Doc<"subscriptions"> | null = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByTransactionId,
      {
        transactionId: args.transactionId,
      },
    )

    if (subscription) {
      return {
        success: true,
        message: "Transaction already processed",
        subscriptionId: subscription._id,
        status: subscription.status,
        alreadyExists: true,
      }
    }

    // Si la transaction n'existe pas, traite le paiement
    const result: {
      subscriptionId: Id<"subscriptions">
      renewed: boolean
      reactivated: boolean
    } = await ctx.runMutation(internal.subscriptions.followUser, {
      transactionId: args.transactionId,
      creatorId: args.creatorId,
      subscriberId: args.subscriberId,
      startDate: args.startDate,
      amountPaid: args.amountPaid,
    })

    return {
      success: true,
      message: "Transaction processed successfully",
      ...result,
      alreadyExists: false,
    }
  },
})

export const checkTransaction = action({
  args: {
    transactionId: v.string(),
  },
  handler: async (ctx, args): Promise<CheckTransactionResult> => {
    // Vérifie si cette transaction existe
    const subscription: Doc<"subscriptions"> | null = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByTransactionId,
      {
        transactionId: args.transactionId,
      },
    )

    if (!subscription) {
      return {
        exists: false,
        transactionId: args.transactionId,
      }
    }

    // La transaction existe, retourne les détails pertinents
    return {
      exists: true,
      transactionId: args.transactionId,
      subscriptionId: subscription._id,
      status: subscription.status,
      details: {
        creator: subscription.creator,
        subscriber: subscription.subscriber,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        amountPaid: subscription.amountPaid,
      },
    }
  },
})
