"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { ProfileImage } from "@/components/shared/profile-image"
import { UserProps } from "@/types"
import {
  CloudinaryUploadWidget,
  CloudinaryUploadWidgetResults,
} from "@cloudinary-util/types"
import { useMutation } from "convex/react"
import { SwitchCamera, X } from "lucide-react"
import {
  CldImage,
  CldUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "next-cloudinary"
import { useTransition } from "react"
import { toast } from "sonner"

export const UpdateImages = ({ currentUser }: { currentUser: UserProps }) => {
  const [isPending, startTransition] = useTransition()
  const updateProfileImage = useMutation(api.users.updateProfileImage)
  const updateBannerImage = useMutation(api.users.updateBannerImage)

  const handleUploadProfile = (
    result: CloudinaryUploadWidgetResults,
    widget: CloudinaryUploadWidget,
  ) => {
    startTransition(async () => {
      try {
        const data = result.info as CloudinaryUploadWidgetInfo
        await updateProfileImage({
          imgUrl: data.secure_url,
          tokenIdentifier: currentUser?.tokenIdentifier!,
        })
        widget.close()
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const handleUploadBanner = (
    result: CloudinaryUploadWidgetResults,
    widget: CloudinaryUploadWidget,
  ) => {
    startTransition(async () => {
      try {
        const data = result.info as CloudinaryUploadWidgetInfo
        await updateBannerImage({
          bannerUrl: data.secure_url,
          tokenIdentifier: currentUser?.tokenIdentifier!,
        })
        widget.close()
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const handleDeleteBanner = () => {
    startTransition(async () => {
      try {
        await updateBannerImage({
          bannerUrl: "banner-profile/placeholder",
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
          <CldImage
            src={
              (currentUser?.imageBanner as string) ||
              "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            }
            alt={currentUser?.name as string}
            className="object-cover"
            fill
          />

          <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/60 transition duration-300 hover:opacity-100 md:opacity-0">
            <CldUploadWidget
              uploadPreset="banner-profile"
              signatureEndpoint="/api/sign-cloudinary-params"
              options={{
                sources: ["local", "camera", "google_drive", "url"],
                publicId: `ban-${currentUser?.externalId}`,
                multiple: false,
                maxFileSize: 6 * 1024 * 1024,
                clientAllowedFormats: ["image"],
              }}
              onSuccess={(result, { widget }) => {
                handleUploadBanner(result, widget)
              }}
            >
              {({ open }) => {
                return (
                  <div
                    className={cn(
                      "flex size-11 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/60",
                      { "cursor-not-allowed": isPending },
                    )}
                    onClick={() => open()}
                  >
                    <SwitchCamera />
                  </div>
                )
              }}
            </CldUploadWidget>

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
        <CldUploadWidget
          uploadPreset="image-profile"
          signatureEndpoint="/api/sign-cloudinary-params"
          options={{
            sources: ["local", "camera", "google_drive", "url"],
            publicId: `img-${currentUser?.externalId}`,
            multiple: false,
            maxFileSize: 6 * 1024 * 1024,
            clientAllowedFormats: ["image"],
            cropping: true,
            croppingAspectRatio: 1,
            croppingDefaultSelectionRatio: 0.8,
            croppingShowDimensions: true,
            croppingCoordinatesMode: "custom",
            showSkipCropButton: false,
            croppingValidateDimensions: true,
          }}
          onSuccess={(result, { widget }) =>
            handleUploadProfile(result, widget)
          }
        >
          {({ open }) => {
            return (
              <Avatar
                className={cn(
                  "relative size-36 cursor-pointer border-4 border-accent object-none object-center max-sm:size-24",
                  { "cursor-not-allowed": isPending },
                )}
                onClick={() => open()}
              >
                {currentUser?.image ? (
                  <ProfileImage
                    src={currentUser.image}
                    width={600}
                    height={600}
                    alt={currentUser?.name || "Profile image"}
                  />
                ) : (
                  <AvatarFallback>XO</AvatarFallback>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <div className="flex size-11 items-center justify-center rounded-full bg-accent text-white">
                    <SwitchCamera />
                  </div>
                </div>
              </Avatar>
            )
          }}
        </CldUploadWidget>
      </div>
    </div>
  )
}
