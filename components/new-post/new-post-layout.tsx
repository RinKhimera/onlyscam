"use client"

import { deleteAsset } from "@/actions/upload-cloudinary"
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
import { cn } from "@/lib/utils"
import { postFormSchema } from "@/schemas/post"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import { CircleX, ImagePlus, LoaderCircle } from "lucide-react"
import {
  CldImage,
  CldUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "next-cloudinary"
import {
  CloudinaryUploadWidget,
  CloudinaryUploadWidgetResults,
} from "@cloudinary-util/types"
import { useEffect, useState, useTransition, useRef } from "react"
import Textarea from "react-expanding-textarea"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { generateRandomString } from "@/utils/generateRandomString"
import Image from "next/image"
import { ProfileImage } from "../shared/profile-image"

export const NewPostLayout = () => {
  const { isAuthenticated } = useConvexAuth()
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )
  const createDraftAsset = useMutation(api.assetsDraft.createDraftAsset)
  const deleteDraftAsset = useMutation(api.assetsDraft.deleteDraftAsset)

  const router = useRouter()

  const [medias, setMedias] = useState<string>("")
  const [publicId, setPublicId] = useState<string>("")
  const [randomString] = useState(() => generateRandomString(6))
  const [isPending, startTransition] = useTransition()

  const isPostCreatedRef = useRef(false)

  useEffect(() => {
    return () => {
      // Ne supprime l'asset que s'il existe et que le post n'a pas été créé
      if (publicId && !isPostCreatedRef.current) {
        deleteAsset(publicId).catch((error) => {
          console.error("Erreur lors de la suppression de l'asset:", error)
        })

        if (publicId) {
          deleteDraftAsset({ publicId }).catch((error) => {
            console.error("Erreur lors de la suppression du brouillon:", error)
          })
        }
      }
    }
  }, [publicId, deleteDraftAsset])

  const createPost = useMutation(api.posts.createPost)

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
      media: [],
    },
  })

  const handleUploadSuccess = (
    result: CloudinaryUploadWidgetResults,
    widget: CloudinaryUploadWidget,
  ) => {
    const data = result.info as CloudinaryUploadWidgetInfo
    setMedias(data.secure_url)
    setPublicId(data.public_id)

    if (currentUser) {
      createDraftAsset({
        author: currentUser._id,
        publicId: data.public_id,
        assetType: data.resource_type,
      }).catch((error) => {
        console.error("Erreur lors de l'enregistrement du brouillon:", error)
      })
    }
    widget.close()
  }

  const onSubmit = async (data: z.infer<typeof postFormSchema>) => {
    startTransition(async () => {
      try {
        data.media = medias ? [medias] : []

        await createPost({
          content: data.content,
          medias: data.media,
          likes: [],
          comments: [],
        })

        // Marquer le post comme créé en utilisant la référence
        isPostCreatedRef.current = true

        if (publicId) {
          await deleteDraftAsset({ publicId })
        }

        toast.success("Votre publication a été partagée")
        router.push("/")
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
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Nouvelle publication
      </h1>

      <div className="relative flex items-stretch space-x-3 border-b border-muted px-4 py-5">
        <Avatar>
          {currentUser?.image ? (
            <ProfileImage
              src={currentUser.image}
              width={100}
              height={100}
              alt={currentUser?.username || "Profile image"}
            />
          ) : (
            <AvatarFallback className="size-11">
              <div className="animate-pulse rounded-full bg-gray-500"></div>
            </AvatarFallback>
          )}
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
                        placeholder="Ecrivez une nouvelle publication"
                        className="mt-1 h-full w-full resize-none border-none bg-transparent text-xl outline-none"
                        {...field}
                      />

                      {medias && (
                        <div className="relative w-fit">
                          <Button
                            size={"icon"}
                            className="absolute right-[10px] top-3 size-8 bg-muted"
                            onClick={async () => {
                              setMedias("")
                              setPublicId("")
                              deleteAsset(publicId)

                              if (publicId) {
                                deleteDraftAsset({ publicId })
                              }
                            }}
                          >
                            <CircleX size={22} />
                          </Button>
                          <CldImage
                            src={medias}
                            alt={""}
                            width={500}
                            height={500}
                            // fill
                            // crop={"thumb"}
                            // gravity="center"
                            sizes="(max-width: 768px) 100vw,
                          (max-width: 1200px) 50vw,
                          33vw"
                            className="mt-2 max-h-[550px] rounded-md object-cover"
                          />
                        </div>
                      )}

                      <div className="mt-8 flex w-full items-center justify-between">
                        <div className="-ml-2 text-blue-500">
                          <CldUploadWidget
                            uploadPreset="post-assets"
                            signatureEndpoint="/api/sign-cloudinary-params"
                            options={{
                              sources: [
                                "local",
                                "camera",
                                "google_drive",
                                "url",
                              ],
                              publicId: `${currentUser?._id}-${randomString}`,
                              multiple: false,
                              maxFileSize: 50 * 1024 * 1024,
                              clientAllowedFormats: ["image", "video"],
                            }}
                            onSuccess={(result, { widget }) =>
                              handleUploadSuccess(result, widget)
                            }
                          >
                            {({ open }) => {
                              return (
                                <button
                                  type="button"
                                  className={cn(
                                    "rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500",
                                    { "cursor-not-allowed": isPending },
                                  )}
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
    </main>
  )
}
