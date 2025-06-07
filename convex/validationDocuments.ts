import { fetchAction } from "convex/nextjs"
import { v } from "convex/values"
import { api } from "./_generated/api"
import { internalMutation, mutation } from "./_generated/server"

export const createDraftDocument = mutation({
  args: {
    userId: v.id("users"),
    publicId: v.string(),
    documentType: v.union(v.literal("identity_card"), v.literal("selfie")),
  },
  handler: async (ctx, args) => {
    const { userId, publicId, documentType } = args

    const draftDocument = await ctx.db.insert("validationDocumentsDraft", {
      userId,
      publicId,
      documentType,
    })

    return draftDocument
  },
})

export const deleteDraftDocument = mutation({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const { publicId } = args

    // Rechercher le document par publicId
    const document = await ctx.db
      .query("validationDocumentsDraft")
      .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
      .first()

    // Si le document existe, le supprimer
    if (document) {
      await ctx.db.delete(document._id)
      return { success: true }
    }

    return { success: false, error: "Document not found" }
  },
})

export const cleanUpDraftDocuments = internalMutation({
  handler: async (ctx) => {
    // Récupérer tous les brouillons de documents
    const draftDocuments = await ctx.db
      .query("validationDocumentsDraft")
      .collect()

    console.log(
      `Found ${draftDocuments.length} draft validation documents to clean up`,
    )

    let successCount = 0
    let errorCount = 0

    // Traiter chaque document
    for (const document of draftDocuments) {
      try {
        await fetchAction(api.internalActions.deleteCloudinaryAsset, {
          publicId: document.publicId,
        })

        // Supprimer l'entrée de la base de données
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
      total: draftDocuments.length,
      success: successCount,
      error: errorCount,
    }
  },
})
