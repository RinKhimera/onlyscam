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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { profileFormSchema } from "@/schemas/profile"
import { UserProps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { CircleX, LoaderCircle } from "lucide-react"
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
  console.log(currentUser)

  const updateProfile = useMutation(api.users.updateUserProfile)

  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: currentUser?.username,
      displayName: currentUser?.name,
      bio: currentUser?.bio,
      urls: (currentUser?.socials || []).map((url) => ({ value: url })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    startTransition(async () => {
      try {
        await updateProfile({
          name: data.displayName,
          username: data.username,
          bio: data.bio,
          socials: (data.urls || []).map((url) => url.value),
          tokenIdentifier: currentUser?.tokenIdentifier!,
        })
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
