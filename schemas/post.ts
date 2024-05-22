import { z } from "zod"

export const postFormSchema = z.object({
  content: z
    .string({ required_error: "Cette entrée est requise." })
    .trim()
    .min(4, {
      message: "La publication doit comporter au moins 4 caractères.",
    })
    .max(400, {
      message: "La publication ne doit pas dépasser 400 caractères.",
    }),
  media: z.array(
    z.string().url({
      message: "Chaque élément du tableau doit être une URL valide.",
    }),
  ),
})
