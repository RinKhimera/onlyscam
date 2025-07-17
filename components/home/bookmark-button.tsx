"use client"

import { useMutation } from "convex/react"
import { Bookmark } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

type BookmarkButtonProps = {
  postId: Id<"posts">
  currentUserBookmark: Id<"posts">[]
  disabled?: boolean
}

export const BookmarkButton = ({
  postId,
  currentUserBookmark,
  disabled = false,
}: BookmarkButtonProps) => {
  const initialBookmarked = currentUserBookmark.includes(postId)

  const [isBookmarked, setIsBookmarked] = useState<Boolean>(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const addBookmark = useMutation(api.posts.addBookmark)
  const removeBookmark = useMutation(api.posts.removeBookmark)

  const handleAddBookmark = async () => {
    startTransition(async () => {
      try {
        await addBookmark({ postId })
        setIsBookmarked(true)
        toast.success("La publication a été ajoutée à vos collections")
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const handleRemoveBookmark = async () => {
    startTransition(async () => {
      try {
        await removeBookmark({ postId })
        setIsBookmarked(false)
        toast.success("La publication a été retirée de vos collections")
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const handleBookmark = async () => {
    if (disabled) return

    if (isBookmarked) {
      handleRemoveBookmark()
    } else {
      handleAddBookmark()
    }
  }

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      disabled={isPending || disabled}
      onClick={handleBookmark}
      className={cn("size-8 rounded-full transition-colors", {
        "cursor-not-allowed opacity-50": disabled,
        "bg-blue-600/15 text-blue-500": isBookmarked,
        "hover:bg-blue-600/15 hover:text-blue-500": !disabled && !isBookmarked,
      })}
    >
      <Bookmark size={20} className={isBookmarked ? "fill-current" : ""} />
    </Button>
  )
}
