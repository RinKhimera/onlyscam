import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { Bookmark } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

type BookmarkButtonProps = {
  postId: Id<"posts">
  currentUserBookmark: Id<"posts">[]
}

export const BookmarkButton = ({
  postId,
  currentUserBookmark,
}: BookmarkButtonProps) => {
  const [isPending, startTransition] = useTransition()

  const addBookmark = useMutation(api.posts.addBookmark)
  const removeBookmark = useMutation(api.posts.removeBookmark)

  const handleAddBookmark = async () => {
    startTransition(async () => {
      try {
        await addBookmark({ postId })
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

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      disabled={isPending}
      onClick={() => {
        if (currentUserBookmark.includes(postId)) {
          handleRemoveBookmark()
        } else {
          handleAddBookmark()
        }
      }}
      className={cn(
        "size-8 rounded-full hover:bg-blue-600/15 hover:text-blue-500",
        { "text-blue-500": currentUserBookmark.includes(postId) },
      )}
    >
      <Bookmark
        size={20}
        fill={currentUserBookmark.includes(postId) ? "blue" : undefined}
      />
    </Button>
  )
}
