import { fetchAction } from "convex/nextjs"
import { v } from "convex/values"
import { api } from "./_generated/api"
import { internalMutation, mutation } from "./_generated/server"

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

    const asset = await ctx.db
      .query("assetsDraft")
      .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
      .first()

    if (asset) {
      await ctx.db.delete(asset._id)
      return { success: true }
    }

    return { success: false, error: "Asset not found" }
  },
})

export const cleanUpDraftAssets = internalMutation({
  handler: async (ctx) => {
    // Récupérer tous les brouillons d'assets (posts)
    const draftAssets = await ctx.db.query("assetsDraft").collect()

    // Récupérer tous les brouillons de documents de validation
    const draftDocuments = await ctx.db
      .query("validationDocumentsDraft")
      .collect()

    const totalAssets = draftAssets.length + draftDocuments.length
    console.log(
      `Found ${totalAssets} draft items to clean up (${draftAssets.length} post assets + ${draftDocuments.length} validation documents)`,
    )

    let successCount = 0
    let errorCount = 0

    // Traiter les assets de posts
    for (const asset of draftAssets) {
      try {
        await fetchAction(api.internalActions.deleteCloudinaryAsset, {
          publicId: asset.publicId,
        })

        await ctx.db.delete(asset._id)
        successCount++
      } catch (error) {
        console.error(`Failed to delete post asset ${asset.publicId}:`, error)
        errorCount++
      }
    }

    // Traiter les documents de validation
    for (const document of draftDocuments) {
      try {
        await fetchAction(api.internalActions.deleteCloudinaryAsset, {
          publicId: document.publicId,
        })

        await ctx.db.delete(document._id)
        successCount++
      } catch (error) {
        console.error(
          `Failed to delete validation document ${document.publicId}:`,
          error,
        )
        errorCount++
      }
    }

    return {
      total: totalAssets,
      success: successCount,
      error: errorCount,
    }
  },
})
