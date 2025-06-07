import { mutation } from "./_generated/server"

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Unauthorized")

  return await ctx.storage.generateUploadUrl()
})
