import { z } from "zod"

export const profileFormSchema = z.object({
  displayName: z
    .string({ required_error: "Cette entrée est requise." })
    .trim()
    .min(3, {
      message: "Le nom d'affichage doit comporter au moins 3 caractères.",
    })
    .max(30, {
      message: "Le nom d'affichage ne doit pas dépasser 30 caractères.",
    }),
  username: z
    .string({ required_error: "Cette entrée est requise." })
    .trim()
    .min(6, {
      message: "L'identifiant doit comporter au moins 6 caractères.",
    })
    .max(24, {
      message: "L'identifiant ne doit pas dépasser 24 caractères.",
    })
    .refine((value) => value === value.toLowerCase(), {
      message:
        "Le nom d'affichage ne doit contenir que des caractères minuscules.",
    })
    .refine((value) => /^[a-z0-9_]+$/.test(value), {
      message:
        "L'identifiant ne doit pas contenir des caractères non-alphanumériques.",
    })
    .refine((value) => (value.match(/_/g) || []).length <= 1, {
      message: "L'identifiant ne doit pas contenir plus d'un underscore.",
    }),
  bio: z
    .string({ required_error: "Cette entrée est requise." })
    .trim()
    .min(4, {
      message: "La description doit comporter au moins 4 caractères.",
    })
    .max(150, {
      message: "La description ne doit pas dépasser 150 caractères.",
    }),
  location: z
    .string({ required_error: "Cette entrée est requise." })
    .trim()
    .min(2, {
      message: "La location doit comporter au moins 2 caractères.",
    })
    .max(40, {
      message: "La location ne doit pas dépasser 40 caractères.",
    }),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Veuillez saisir une URL valide." }),
      }),
    )
    .optional(),
})
