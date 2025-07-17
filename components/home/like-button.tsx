"use client"

import { useMutation } from "convex/react"
import { Heart } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

type LikeButtonProps = {
  postId: Id<"posts">
  postLikes: Id<"users">[]
  currentUserId: Id<"users">
  disabled?: boolean
}

export const LikeButton = ({
  postId,
  postLikes,
  currentUserId,
  disabled = false,
}: LikeButtonProps) => {
  const [isPending, startTransition] = useTransition()

  const likePost = useMutation(api.posts.likePost)
  const unlikePost = useMutation(api.posts.unlikePost)

  const handleLike = async () => {
    if (disabled) return

    startTransition(async () => {
      try {
        await likePost({ postId })
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
    })
  }

  const handleUnlike = async () => {
    startTransition(async () => {
      try {
        await unlikePost({ postId })
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
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 rounded-full transition-colors", {
          "cursor-not-allowed opacity-50": disabled,
          "bg-red-600/15 text-red-500": postLikes.includes(currentUserId),
          "hover:bg-red-600/15 hover:text-red-500":
            !disabled && !postLikes.includes(currentUserId),
        })}
        onClick={() => {
          if (postLikes.includes(currentUserId)) {
            handleUnlike()
          } else {
            handleLike()
          }
        }}
        disabled={disabled}
      >
        <Heart
          size={20}
          className={postLikes.includes(currentUserId) ? "fill-current" : ""}
        />
      </Button>
    </div>
  )
}
