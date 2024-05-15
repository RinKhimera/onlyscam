"use client"

import { UpdateImages } from "@/components/profile/update-images"
import { ImageUploadInfo } from "@/components/shared/image-upload-info"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { profileFormSchema } from "@/schemas/profile"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import { CircleX, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const OnboardingPage = () => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const updateProfile = useMutation(api.users.updateUserProfile)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      location: "",
      urls: [].map((url) => ({ value: url })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  const { watch } = form
  const watchUsername = watch("username")

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    startTransition(async () => {
      try {
        if (checkUsername === true) {
          await updateProfile({
            name: data.displayName,
            username: data.username,
            bio: data.bio,
            location: data.location,
            socials: (data.urls || []).map((url) => url.value),
            tokenIdentifier: currentUser?.tokenIdentifier!,
          })

          router.push("/")
          // toast.success("Vos modifications ont été enregistré")
        } else if (checkUsername === false) {
          toast.error("Cet identifiant est déjà pris !", {
            description: "Veuillez en choisir un autre",
          })
        }
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const checkUsername = useQuery(api.users.getAvailableUsername, {
    username: watchUsername || "",
    tokenIdentifier: currentUser?.tokenIdentifier! || "",
  })

  if (!currentUser) {
    return <div>Loading...</div> // or your loading component
  }

  if (currentUser?.username) router.push("/")

  return (
    <div className="container mx-auto my-4 max-w-2xl">
      <div className="mb-4">
        <div className="text-3xl font-semibold leading-none tracking-tight max-sm:text-xl">
          Finalisation de votre profil
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Veuillez compléter vos informations pour la finalisation de votre
          profil. Pas de soucis, vous pourrez les modifier à tout moment.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <Label>Photo de bannière et de profil</Label>
        <ImageUploadInfo />
      </div>

      <UpdateImages currentUser={currentUser} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-16 space-y-6"
        >
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
                <FormMessage>
                  {checkUsername === false &&
                    "Cet identifiant est déjà pris. Veuillez en choisir un autre."}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="La vie est dure. Puis tu meurs. Ensuite, ils vous jettent de la terre au visage. Ensuite, les vers vous mangent. Soyez reconnaissant si cela se produit dans cet ordre..."
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

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localisation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Quelque part entre rêve et réalité"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Votre localisation actuelle. Cela peut être une ville ou un
                  pays.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.length === 0 && (
            <FormItem>
              <FormLabel>URLs</FormLabel>
              <FormDescription>
                Vous pouvez ajoutez des liens vers votre site Web, votre blog ou
                vos profils de réseaux sociaux.
              </FormDescription>
            </FormItem>
          )}
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem className="mb-0">
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
                          placeholder="https://samuelpokam.com"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Compléter l'inscription"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default OnboardingPage
