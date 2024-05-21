import { UpdateImages } from "@/components/profile/update-images"
import { ImageUploadInfo } from "@/components/shared/image-upload-info"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { UserProps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { CircleX, Info, LoaderCircle, SwitchCamera, X } from "lucide-react"
import { useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

type UpdateProfileDialogProps = {
  currentUser: UserProps
}

export const UpdateProfileDialog = ({
  currentUser,
}: UpdateProfileDialogProps) => {
  const [isPending, startTransition] = useTransition()

  const updateProfile = useMutation(api.users.updateUserProfile)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: currentUser?.username,
      displayName: currentUser?.name,
      bio: currentUser?.bio,
      location: currentUser?.location,
      urls: (currentUser?.socials || []).map((url) => ({ value: url })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  const { watch } = form
  const watchUsername = watch("username")

  const checkUsername = useQuery(api.users.getAvailableUsername, {
    username: watchUsername || "",
    tokenIdentifier: currentUser?.tokenIdentifier! || "",
  })

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

          toast.success("Vos modifications ont été enregistré")
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="rounded-3xl border-2">
          Modifier le profil
        </Button>
      </DialogTrigger>
      <DialogContent className="h-5/6 overflow-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Apportez des modifications à votre profil ici. Cliquez sur
            Enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <Label>Photo de bannière et de profil</Label>
          <ImageUploadInfo />
        </div>

        <UpdateImages currentUser={currentUser} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-12 space-y-6"
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
                  Vous pouvez ajoutez des liens vers votre site Web, votre blog
                  ou vos profils de réseaux sociaux.
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

            <DialogFooter className="flex flex-row items-center justify-between">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Fermer
                </Button>
              </DialogClose>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Enregister"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
