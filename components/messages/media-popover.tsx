"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import { ConversationProps } from "@/types"
import { useMutation, useQuery } from "convex/react"
import { ImageIcon, Plus, Video } from "lucide-react"
import { CldUploadButton, CldUploadWidget } from "next-cloudinary"
import { useState, useTransition } from "react"
import ReactPlayer from "react-player"
import { toast } from "sonner"

export const MediaPopover = ({
  conversation,
}: {
  conversation: ConversationProps
}) => {
  const [isPending, startTransition] = useTransition()

  // const generateUploadUrl = useMutation(api.conversations.generateUploadUrl)
  const sendImage = useMutation(api.messages.sendImage)
  const sendVideo = useMutation(api.messages.sendVideo)

  const currentUser = useQuery(
    api.users.getCurrentUser,
    //  isAuthenticated ? undefined : "skip",
  )

  const handleSendImage = async (result: any) => {
    startTransition(async () => {
      try {
        await sendImage({
          conversation: conversation!._id,
          imgUrl: result?.info?.secure_url,
          sender: currentUser!._id,
        })

        console.log(result)
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Le partage a échoué. Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  // const handleSendVideo = async () => {
  //   startTransition(async () => {
  //     try {
  //       const postUrl = await generateUploadUrl()
  //       const result = await fetch(postUrl, {
  //         method: "POST",
  //         headers: { "Content-Type": selectedVideo!.type },
  //         body: selectedVideo,
  //       })

  //       const { storageId } = await result.json()

  //       await sendVideo({
  //         videoId: storageId,
  //         conversation: conversation!._id,
  //         sender: currentUser!._id,
  //       })

  //       setSelectedVideo(null)
  //     } catch (error) {
  //       console.error(error)
  //       toast.error("Une erreur s'est produite !", {
  //         description:
  //           "Le partage a échoué. Veuillez vérifier votre connexion internet et réessayer",
  //       })
  //     }
  //   })
  // }

  return (
    <>
      <CldUploadWidget
        uploadPreset="onlyscam-preset"
        options={{
          cropping: true,
          croppingAspectRatio: 1,
          // croppingCoordinatesMode: "face",
        }}
        onSuccess={handleSendImage}
      >
        {({ open }) => {
          return (
            <button className="flex items-center p-2" onClick={() => open()}>
              <ImageIcon size={18} className="mr-1" /> Photo
            </button>
          )
        }}
      </CldUploadWidget>
      {/* <DropdownMenu>
        <DropdownMenuTrigger>
          <Plus className="text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={20} alignOffset={-45} align="start">
          <DropdownMenuItem asChild>
            <CldUploadWidget
              uploadPreset="onlyscam-preset"
              options={{ cropping: true, croppingAspectRatio: 0.5 }}
              onSuccess={handleSendImage}
            >
              {({ open }) => {
                return (
                  <button
                    className="flex items-center p-2"
                    onClick={() => open()}
                  >
                    <ImageIcon size={18} className="mr-1" /> Photo
                  </button>
                )
              }}
            </CldUploadWidget>
          </DropdownMenuItem>
          <DropdownMenuItem
          // onClick={() => videoInput.current!.click()}
          >
            <Video size={20} className="mr-1" />
            Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </>
  )
}
