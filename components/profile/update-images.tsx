import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { useEdgeStore } from "@/lib/edgestore"
import { cn } from "@/lib/utils"
import { UserProps } from "@/types"
import { useMutation } from "convex/react"
import { Loader, SwitchCamera, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"

export const UpdateImages = ({ currentUser }: { currentUser: UserProps }) => {
  const imgProfileRef = useRef<HTMLInputElement>(null)
  const imgBannerRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingStatus, setloadingStatus] = useState<number>(0)

  const updateProfileImage = useMutation(api.users.updateProfileImage)
  const updateBannerImage = useMutation(api.users.updateBannerImage)

  const { edgestore } = useEdgeStore()

  const handleUploadProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(async () => {
      try {
        const file = e.target.files?.[0]

        if (file) {
          const res = await edgestore.profileImages.upload({
            file,
            onProgressChange: (progress: number) => {
              setloadingStatus(progress)
              console.log(progress)
            },
          })

          if (res) {
            await updateProfileImage({
              imgUrl: res.url,
              tokenIdentifier: currentUser?.tokenIdentifier!,
            })

            toast.success("Votre photo de profil a été mise à jour")
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
    setloadingStatus(0)
  }

  const handleUploadBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(async () => {
      try {
        const file = e.target.files?.[0]

        if (file) {
          const res = await edgestore.bannerImages.upload({
            file,
            onProgressChange: (progress: number) => {
              setloadingStatus(progress)
              console.log(progress)
            },
          })

          if (res) {
            await updateBannerImage({
              bannerUrl: res.url,
              tokenIdentifier: currentUser?.tokenIdentifier!,
            })
            toast.success("Votre photo de bannière a été mise à jour")
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
    setloadingStatus(0)
  }

  const handleDeleteBanner = () => {
    startTransition(async () => {
      try {
        await updateBannerImage({
          bannerUrl: "",
          tokenIdentifier: currentUser?.tokenIdentifier!,
        })

        toast.success("Votre photo de bannière a supprimé")
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
    <div className="relative">
      <div>
        <AspectRatio ratio={3 / 1} className="relative bg-muted">
          <Image
            className="object-cover"
            src={
              (currentUser?.imageBanner as string) ||
              "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            }
            alt={currentUser?.name as string}
            fill
          />

          <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/60 transition duration-300 hover:opacity-100 md:opacity-0">
            <div
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/60",
                { "cursor-not-allowed": isPending },
              )}
              onClick={() => imgBannerRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={imgBannerRef}
                onChange={handleUploadBanner}
                disabled={isPending}
                hidden
              />

              <SwitchCamera />
            </div>

            <div
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/60",
                { "cursor-not-allowed": isPending },
              )}
              onClick={isPending ? undefined : handleDeleteBanner}
            >
              <X />
            </div>
          </div>
        </AspectRatio>
      </div>

      <div className="absolute -bottom-[48px] left-5 max-sm:-bottom-[38px]">
        <input
          type="file"
          accept="image/*"
          ref={imgProfileRef}
          onChange={handleUploadProfile}
          disabled={isPending}
          hidden
        />

        <Avatar
          className={cn(
            "relative size-28 cursor-pointer border-4 border-accent object-none object-center max-sm:size-20",
            { "cursor-not-allowed": isPending },
          )}
          onClick={() => imgProfileRef.current?.click()}
        >
          <AvatarImage src={currentUser?.image} className="object-cover" />
          <AvatarFallback>XO</AvatarFallback>

          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 hover:opacity-100">
            <div className="flex size-11 items-center justify-center rounded-full bg-accent text-white">
              <SwitchCamera />
            </div>
          </div>
        </Avatar>
      </div>

      {isPending && (
        <div className="absolute -bottom-[40px] right-0 flex items-center gap-1 text-lg font-medium text-muted-foreground">
          <Loader className="animate-spin text-primary" /> {loadingStatus}%
        </div>
      )}
    </div>
  )
}
