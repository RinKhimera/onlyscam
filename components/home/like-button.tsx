import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import clsx from "clsx"
import { useMutation } from "convex/react"
import { Heart } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

type LikeButtonProps = {
  postId: Id<"posts">
  postLikes: Id<"users">[]
  currentUserId: Id<"users">
}

export const LikeButton = ({
  postId,
  postLikes,
  currentUserId,
}: LikeButtonProps) => {
  const [isPending, startTransition] = useTransition()

  const likePost = useMutation(api.posts.likePost)
  const unlikePost = useMutation(api.posts.unlikePost)

  const handleLike = async () => {
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
    <Button
      variant={"ghost"}
      size={"icon"}
      disabled={isPending}
      onClick={() => {
        if (postLikes.includes(currentUserId)) {
          handleUnlike()
        } else {
          handleLike()
        }
      }}
      className={clsx(
        "size-8 rounded-full hover:bg-pink-600/15 hover:text-rose-500",
        {
          "text-rose-500": postLikes.includes(currentUserId),
        },
      )}
    >
      <Heart
        size={20}
        fill={postLikes.includes(currentUserId) ? "red" : undefined}
      />
    </Button>
  )
}
