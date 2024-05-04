import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog"
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
import Image from "next/image"
import { useEffect, useRef, useState, useTransition } from "react"
import ReactPlayer from "react-player"
import { toast } from "sonner"

export const MediaPopover = ({
  conversation,
}: {
  conversation: ConversationProps
}) => {
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  // const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl)
  const sendImage = useMutation(api.messages.sendImage)
  const sendVideo = useMutation(api.messages.sendVideo)

  const currentUser = useQuery(
    api.users.getCurrentUser,
    //  isAuthenticated ? undefined : "skip",
  )

  const handleSendImage = async () => {
    startTransition(async () => {
      try {
        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl()
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage!.type },
          body: selectedImage,
        })

        const { storageId } = await result.json()
        // Step 3: Save the newly allocated storage id to the database
        await sendImage({
          conversation: conversation!._id,
          imgId: storageId,
          sender: currentUser!._id,
        })

        setSelectedImage(null)
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Le partage a échoué. Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const handleSendVideo = async () => {
    startTransition(async () => {
      try {
        const postUrl = await generateUploadUrl()
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedVideo!.type },
          body: selectedVideo,
        })

        const { storageId } = await result.json()

        await sendVideo({
          videoId: storageId,
          conversation: conversation!._id,
          sender: currentUser!._id,
        })

        setSelectedVideo(null)
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Le partage a échoué. Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  return (
    <>
      <input
        type="file"
        ref={imageInput}
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files![0])}
        hidden
      />

      <input
        type="file"
        ref={videoInput}
        accept="video/*"
        onChange={(e) => setSelectedVideo(e.target?.files![0])}
        hidden
      />

      {selectedImage && (
        <MediaImageDialog
          isOpen={selectedImage !== null}
          onClose={() => setSelectedImage(null)}
          selectedImage={selectedImage}
          isLoading={isPending}
          handleSendImage={handleSendImage}
        />
      )}

      {selectedVideo && (
        <MediaVideoDialog
          isOpen={selectedVideo !== null}
          onClose={() => setSelectedVideo(null)}
          selectedVideo={selectedVideo}
          isLoading={isPending}
          handleSendVideo={handleSendVideo}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Plus className="text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={20} alignOffset={-45} align="start">
          <DropdownMenuItem onClick={() => imageInput.current!.click()}>
            <ImageIcon size={18} className="mr-1" /> Photo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => videoInput.current!.click()}>
            <Video size={20} className="mr-1" />
            Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

type MediaImageDialogProps = {
  isOpen: boolean
  onClose: () => void
  selectedImage: File
  isLoading: boolean
  handleSendImage: () => void
}

const MediaImageDialog = ({
  isOpen,
  onClose,
  selectedImage,
  isLoading,
  handleSendImage,
}: MediaImageDialogProps) => {
  const [renderedImage, setRenderedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedImage) return
    const reader = new FileReader()
    reader.onload = (e) => setRenderedImage(e.target?.result as string)
    reader.readAsDataURL(selectedImage)
  }, [selectedImage])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        <DialogDescription className="flex flex-col items-center justify-center gap-10">
          {renderedImage && (
            <Image
              src={renderedImage}
              width={300}
              height={300}
              alt="selected image"
            />
          )}
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleSendImage}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

type MediaVideoDialogProps = {
  isOpen: boolean
  onClose: () => void
  selectedVideo: File
  isLoading: boolean
  handleSendVideo: () => void
}

const MediaVideoDialog = ({
  isOpen,
  onClose,
  selectedVideo,
  isLoading,
  handleSendVideo,
}: MediaVideoDialogProps) => {
  const renderedVideo = URL.createObjectURL(
    new Blob([selectedVideo], { type: "video/*" }),
  )

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        <DialogDescription>Video</DialogDescription>
        <div className="w-full">
          {renderedVideo && (
            <ReactPlayer url={renderedVideo} controls width="100%" />
          )}
        </div>
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={handleSendVideo}
        >
          {isLoading ? "Envoi en cours..." : "Envoyer"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
