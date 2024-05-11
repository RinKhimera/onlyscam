import { z } from "zod"

export const profileFormSchema = z.object({
  displayName: z
    .string({ required_error: "Cette entrée est requise." })
    .min(2, {
      message: "Le nom d'affichage doit comporter au moins 2 caractères.",
    })
    .max(30, {
      message: "Le nom d'affichage ne doit pas dépasser 30 caractères.",
    }),
  username: z
    .string({ required_error: "Cette entrée est requise." })
    .min(2, {
      message: "Le nom d'affichage doit comporter au moins 2 caractères.",
    })
    .max(30, {
      message: "Le nom d'affichage ne doit pas dépasser 30 caractères.",
    }),
  // email: z.string({ required_error: "Cette entrée est requise." }).email(),
  bio: z
    .string({ required_error: "Cette entrée est requise." })
    .min(4, {
      message: "La description doit comporter au moins 4 caractères.",
    })
    .max(150, {
      message: "La description ne doit pas dépasser 150 caractères.",
    }),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Veuillez saisir une URL valide." }),
      }),
    )
    .optional(),
})
