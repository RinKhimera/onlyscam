import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { LoaderCircle } from "lucide-react"
import { useTransition } from "react"
// import Textarea from "react-expanding-textarea"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { ProfileImage } from "@/components/shared/profile-image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { commentFormSchema } from "@/schemas/comment"

export const CreateComment = ({
  currentUser,
  postId,
}: {
  currentUser: Doc<"users">
  postId: Id<"posts">
}) => {
  const [isPending, startTransition] = useTransition()
  const createComment = useMutation(api.comments.createComment)
  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof commentFormSchema>) => {
    startTransition(async () => {
      try {
        await createComment({
          postId: postId,
          content: data.content,
        })

        form.reset({
          content: "",
        })

        toast.success("Votre réponse a été publiée")
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
    <div className="relative flex items-stretch space-x-3 border-b border-muted px-4 py-5 max-sm:px-1">
      {/* Avatar version desktop et tablette */}
      <div className="hidden sm:block">
        <Avatar className="overflow-hidden">
          <ProfileImage
            src={currentUser?.image}
            alt={currentUser?.username || "Avatar"}
            width={44}
            height={44}
          />
          <AvatarFallback className="size-11">
            <div className="animate-pulse rounded-full bg-gray-500"></div>
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Avatar version mobile (plus petit) */}
      <div className="block sm:hidden">
        <Avatar className="size-8 overflow-hidden">
          <ProfileImage
            src={currentUser?.image}
            alt={currentUser?.username || "Avatar"}
            width={32}
            height={32}
          />
          <AvatarFallback className="size-8">
            <div className="animate-pulse rounded-full bg-gray-500"></div>
          </AvatarFallback>
        </Avatar>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex h-full w-full flex-col">
                    {/* <Textarea
                      placeholder="Poster votre réponse"
                      className="mt-1 h-full w-full resize-none border-none bg-transparent text-xl outline-none max-sm:text-base"
                      {...field}
                    /> */}

                    <div className="mt-2 flex w-full justify-end">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-fit rounded-full bg-primary px-4 py-2 font-bold hover:bg-primary/80 max-sm:px-3 max-sm:py-1.5 max-sm:text-sm"
                      >
                        {isPending ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          "Répondre"
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                {field.value && <FormMessage />}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
