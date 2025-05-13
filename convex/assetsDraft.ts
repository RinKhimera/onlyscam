import { v } from "convex/values"
import { internalMutation, mutation } from "./_generated/server"
import { api } from "./_generated/api"
import { fetchAction } from "convex/nextjs"

export const createDraftAsset = mutation({
  args: {
    author: v.id("users"),
    publicId: v.string(),
    assetType: v.string(),
  },
  handler: async (ctx, args) => {
    const { author, publicId, assetType } = args

    const draftAsset = await ctx.db.insert("assetsDraft", {
      author,
      publicId,
      assetType,
    })

    return draftAsset
  },
})

export const deleteDraftAsset = mutation({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const { publicId } = args

    // Rechercher l'asset par publicId
    const asset = await ctx.db
      .query("assetsDraft")
      .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
      .first()

    // Si l'asset existe, le supprimer
    if (asset) {
      await ctx.db.delete(asset._id)
      return { success: true }
    }

    return { success: false, error: "Asset not found" }
  },
})

export const cleanUpDraftAssets = internalMutation({
  handler: async (ctx) => {
    // Récupérer tous les brouillons d'assets
    const draftAssets = await ctx.db.query("assetsDraft").collect()

    // Log pour debugging
    console.log(`Found ${draftAssets.length} draft assets to clean up`)

    // Compter les succès et échecs
    let successCount = 0
    let errorCount = 0

    // Traiter chaque asset
    for (const asset of draftAssets) {
      try {
        await fetchAction(api.internalActions.deleteCloudinaryAsset, {
          publicId: asset.publicId,
        })

        // Supprimer l'entrée de la base de données
        await ctx.db.delete(asset._id)

        successCount++
      } catch (error) {
        console.error(`Failed to delete asset ${asset.publicId}:`, error)
        errorCount++
      }
    }

    return {
      total: draftAssets.length,
      success: successCount,
      error: errorCount,
    }
  },
})
