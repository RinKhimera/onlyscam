"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { api } from "@/convex/_generated/api"
import { postFormSchema } from "@/schemas/post"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import { ImagePlus, LoaderCircle } from "lucide-react"
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary"
import { useState, useTransition } from "react"
import Textarea from "react-expanding-textarea"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const CreatePost = () => {
  const [medias, setMedias] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const createPost = useMutation(api.posts.createPost)

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
      media: [],
    },
  })

  const onSubmit = async (data: z.infer<typeof postFormSchema>) => {
    startTransition(async () => {
      try {
        data.media = medias

        await createPost({
          content: data.content,
          medias: data.media,
          likes: [],
          comments: [],
        })

        form.reset({
          content: "",
          media: [],
        })

        setMedias([])

        toast.success("Votre publication a été partagée")
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
    <div className="relative flex items-stretch space-x-3 border-b border-muted px-4 py-5 max-sm:hidden">
      <Avatar>
        <AvatarImage src={currentUser?.image} alt={currentUser?.username} />
        <AvatarFallback className="size-11">
          <div className="animate-pulse rounded-full bg-gray-500"></div>
        </AvatarFallback>
      </Avatar>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex h-full w-full flex-col">
                    <Textarea
                      placeholder="Partager une publication"
                      className="mt-1 h-full w-full resize-none border-none bg-transparent text-xl outline-none"
                      {...field}
                    />

                    <div className="mt-8 flex w-full items-center justify-between">
                      <div className="-ml-2 text-blue-500">
                        <CldUploadWidget
                          uploadPreset="post-videos"
                          signatureEndpoint="/api/sign-cloudinary-params"
                          options={{
                            sources: ["local", "google_drive", "url", "camera"],
                            // publicId: "profile_buddies204",
                          }}
                          onSuccess={(result, { widget }) => {
                            const data =
                              result.info as CloudinaryUploadWidgetInfo

                            setMedias((prevMedias) => {
                              if (!prevMedias.includes(data.secure_url)) {
                                return [...prevMedias, data.secure_url]
                              } else {
                                return prevMedias
                              }
                            })
                            // widget.close()
                          }}
                        >
                          {({ open }) => {
                            return (
                              <button
                                type="button"
                                className="rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500"
                                onClick={() => open()}
                              >
                                <ImagePlus size={20} />
                              </button>
                            )
                          }}
                        </CldUploadWidget>
                      </div>

                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-fit rounded-full bg-sky-500 px-4 py-2 font-bold hover:bg-sky-600"
                      >
                        {isPending ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          "Publier"
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
