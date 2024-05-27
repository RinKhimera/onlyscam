import { z } from "zod"

export const commentFormSchema = z.object({
  content: z
    .string({ required_error: "Cette entrée est requise." })
    .trim()
    .min(2, {
      message: "Votre réponse doit comporter au moins 2 caractères.",
    })
    .max(150, {
      message: "La publication ne doit pas dépasser 150 caractères.",
    }),
})
