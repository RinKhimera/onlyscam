"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
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
import { cn } from "@/lib/utils"
import { profileFormSchema } from "@/schemas/profile"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleX, LoaderCircle } from "lucide-react"
import { useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const UpdateProfileDialog = () => {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      urls: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    startTransition(async () => {
      try {
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

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Compléter l'inscription"
              )}
            </Button>
          </form>
        </Form>

        <DialogFooter>
          <Button type="submit">Enregister</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
