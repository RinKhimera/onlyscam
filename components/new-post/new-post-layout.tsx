"use client"

import {
  CloudinaryUploadWidget,
  CloudinaryUploadWidgetResults,
} from "@cloudinary-util/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { CircleX, Globe, ImagePlus, LoaderCircle, Lock } from "lucide-react"
import {
  CldImage,
  CldUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "next-cloudinary"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import Textarea from "react-expanding-textarea"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { cn } from "@/lib/utils"
import { postFormSchema } from "@/schemas/post"
import { generateRandomString } from "@/utils/generateRandomString"
import { ProfileImage } from "../shared/profile-image"

export const NewPostLayout = () => {
  const router = useRouter()

  const { currentUser } = useCurrentUser()

  const createDraftAsset = useMutation(api.assetsDraft.createDraftAsset)
  const deleteDraftAsset = useMutation(api.assetsDraft.deleteDraftAsset)

  const [medias, setMedias] = useState<string>("")
  const [publicId, setPublicId] = useState<string>("")
  const [randomString] = useState(() => generateRandomString(6))
  const [isPending, startTransition] = useTransition()
  const [visibility, setVisibility] = useState<"public" | "subscribers_only">(
    "public",
  )

  const isPostCreatedRef = useRef(false)

  if (currentUser?.accountType === "USER") router.push("/")

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
          visibility: visibility,
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

                      <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Actions de gauche (upload + visibilité) */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Bouton upload */}
                          {!currentUser ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "flex items-center gap-2 rounded-full border-muted hover:bg-blue-600/15 hover:text-blue-500",
                                "cursor-not-allowed opacity-60",
                              )}
                              disabled
                            >
                              <ImagePlus size={18} />
                              <span className="hidden sm:inline">Média</span>
                            </Button>
                          ) : (
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
                                publicId: `${currentUser._id}-${randomString}`,
                                multiple: false,
                                maxFileSize: 50 * 1024 * 1024,
                                clientAllowedFormats: ["image", "video"],
                              }}
                              onSuccess={(result, { widget }) =>
                                handleUploadSuccess(result, widget)
                              }
                            >
                              {({ open }) => (
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  className={cn(
                                    "flex items-center gap-2 rounded-full border-muted",
                                    { "cursor-not-allowed": isPending },
                                  )}
                                  onClick={() => open()}
                                  disabled={isPending}
                                >
                                  <ImagePlus size={18} />
                                  <span className="hidden sm:inline">
                                    Média
                                  </span>
                                </Button>
                              )}
                            </CldUploadWidget>
                          )}

                          {/* Sélecteur de visibilité */}
                          <Select
                            defaultValue="public"
                            onValueChange={(value) =>
                              setVisibility(
                                value as "public" | "subscribers_only",
                              )
                            }
                          >
                            <SelectTrigger className="h-9 w-auto rounded-full border-muted bg-transparent hover:bg-muted/30">
                              {visibility === "public" ? (
                                <div className="flex items-center gap-2">
                                  <Globe size={18} className="text-green-500" />
                                  <span className="hidden sm:inline">
                                    Tout le monde
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Lock size={18} className="text-primary" />
                                  <span className="hidden sm:inline">
                                    Fans uniquement
                                  </span>
                                </div>
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">
                                <div className="flex items-center gap-2">
                                  <Globe size={16} className="text-green-500" />
                                  <span>Tout le monde</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="subscribers_only">
                                <div className="flex items-center gap-2">
                                  <Lock size={16} className="text-primary" />
                                  <span>Fans uniquement</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bouton de publication */}
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="w-full rounded-full px-4 py-2 font-bold sm:w-auto"
                        >
                          {isPending ? (
                            <LoaderCircle className="mr-2 animate-spin" />
                          ) : null}
                          <span>Publier</span>
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
