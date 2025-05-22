"use client"

import { useQuery } from "convex/react"
import { Lock, Play } from "lucide-react"
import { CldImage, CldVideoPlayer } from "next-cloudinary"
import "next-cloudinary/dist/cld-video-player.css"
import { useState } from "react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

export const UserGallery = ({
  authorId,
  currentUser,
}: {
  authorId: Id<"users">
  currentUser: Doc<"users">
}) => {
  const userGallery = useQuery(api.posts.getUserGallery, { authorId })
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Vérifier si l'utilisateur est abonné à l'auteur pour accéder aux contenus protégés
  const subscriptionStatus = useQuery(api.subscriptions.getFollowSubscription, {
    creatorId: authorId,
    subscriberId: currentUser._id,
  })

  const isSubscriber = subscriptionStatus?.status === "active"
  const isOwnProfile = authorId === currentUser._id

  const handleMediaClick = (media: string) => {
    setSelectedMedia(media)
    setIsDialogOpen(true)
  }

  const isVideo = (media: string) =>
    media.startsWith("https://res.cloudinary.com/onlyscam/video/")

  // Fonction pour générer une URL de thumbnail à partir d'une URL de vidéo Cloudinary
  const getVideoThumbnail = (videoUrl: string) => {
    // Extraire uniquement l'ID public de la vidéo
    const publicIdMatch = videoUrl.match(/\/upload\/v\d+\/(.+?)(\.\w+)?$/)
    if (!publicIdMatch || !publicIdMatch[1]) {
      return videoUrl // Fallback si l'extraction échoue
    }

    const publicId = publicIdMatch[1]
    // Construire une URL de thumbnail fiable
    return `https://res.cloudinary.com/onlyscam/video/upload/c_fill,h_400,w_400,q_auto,so_0/f_jpg/${publicId}`
  }

  return (
    <>
      {!userGallery || userGallery.length === 0 ? (
        <div className="mt-16 h-full px-4 text-center text-xl text-muted-foreground">
          Pas de médias pour le moment
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1 pb-2">
          {userGallery.map((item) => {
            const isMediaProtected = item.visibility === "subscribers_only"
            const canViewMedia =
              isOwnProfile || !isMediaProtected || isSubscriber
            const mediaUrl = item.medias[0]
            const isVideoMedia = isVideo(mediaUrl)

            return (
              <div key={item._id} className="relative aspect-square">
                <AspectRatio ratio={1} className="overflow-hidden">
                  <div
                    className={cn(
                      "relative h-full w-full cursor-pointer",
                      !canViewMedia && "bg-muted/50 backdrop-blur-sm",
                    )}
                    onClick={() => {
                      if (canViewMedia) {
                        handleMediaClick(mediaUrl)
                      }
                    }}
                  >
                    {canViewMedia ? (
                      <div className="relative h-full w-full">
                        {isVideoMedia ? (
                          <div className="flex h-full w-full items-center justify-center bg-muted/20">
                            <div className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary/80">
                              <Play className="h-6 w-6 fill-white text-white" />
                            </div>
                            <CldImage
                              src={getVideoThumbnail(mediaUrl)}
                              alt="Thumbnail"
                              width={400}
                              height={400}
                              className="h-full w-full object-cover opacity-80"
                            />
                          </div>
                        ) : (
                          <CldImage
                            src={mediaUrl}
                            alt="Media content"
                            width={400}
                            height={400}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Lock className="size-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </AspectRatio>

                {isMediaProtected && (
                  <div className="absolute right-1.5 top-1.5 rounded-md bg-background/80 p-1">
                    <Lock className="size-4 text-primary" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog pour afficher le média en plein écran */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex h-screen max-w-none items-center justify-center border-none bg-black/90 p-0 sm:rounded-none">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {selectedMedia && isVideo(selectedMedia) ? (
              <div className="video-container">
                <CldVideoPlayer
                  width={1080}
                  height={720}
                  src={selectedMedia}
                  sourceTypes={["hls"]}
                  controls={true}
                  autoPlay={true}
                  loop={false}
                  muted={false}
                  transformation={{
                    streaming_profile: "hd",
                  }}
                  className="max-h-[90vh]"
                />
              </div>
            ) : (
              selectedMedia && (
                <CldImage
                  src={selectedMedia}
                  alt="Media full view"
                  width={1200}
                  height={1200}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
