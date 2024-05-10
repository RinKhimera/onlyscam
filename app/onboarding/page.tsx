"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexAuth, useQuery } from "convex/react"
import { CircleX } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const profileFormSchema = z.object({
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
  bio: z
    .string()
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

type ProfileFormValues = z.infer<typeof profileFormSchema>

const OnbordingPage = () => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  // This can come from your database or API.
  const defaultValues: Partial<ProfileFormValues> = {
    bio: "I own a computer.",
    urls: [
      // { value: "https://shadcn.com" },
      // { value: "http://twitter.com/shadcn" },
      { value: "" },
    ],
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  function onSubmit(data: ProfileFormValues) {
    toast.success("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
    console.log(data)
  }

  return (
    <div className="container mx-auto my-4 max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d&apos;affichage</FormLabel>
                <FormControl>
                  <Input placeholder="TypeScript Enthusiast" {...field} />
                </FormControl>
                <FormDescription>
                  Il s&apos;agit de votre nom d&apos;affichage public. Il peut
                  s&apos;agir de votre vrai nom ou d&apos;un pseudonyme.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifiant</FormLabel>
                <FormControl>
                  <Input placeholder="rin_khimera" {...field} />
                </FormControl>
                <FormDescription>
                  Votre identifiant est unique et servira toujours à vous
                  retrouver.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="rin_khimera"
                    type="email"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Vous pouvez gérer les adresses e-mail vérifiées plus tard.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Parle nous un peu de toi..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Une courte biographie qui apparaîtra sur votre profil.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && "sr-only")}>
                      Vous pouvez ajoutez des liens vers votre site Web, votre
                      blog ou vos profils de réseaux sociaux.
                    </FormDescription>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://github.com/RinKhimera"
                        />
                      </FormControl>
                      <Button
                        variant={"default"}
                        size={"icon"}
                        onClick={() => remove(index)}
                      >
                        <CircleX />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ value: "" })}
            >
              Ajouter un lien
            </Button>
          </div>
          <Button type="submit">Compléter l&apos;inscription</Button>
        </form>
      </Form>
    </div>
  )
}

export default OnbordingPage
