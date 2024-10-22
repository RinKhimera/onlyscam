"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { Ellipsis, LoaderCircle } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

export const PostEllipsis = ({ postId }: { postId: Id<"posts"> }) => {
  const [isPending, startTransition] = useTransition()

  const deletePost = useMutation(api.posts.deletePost)

  const deleteHandler = async () => {
    startTransition(async () => {
      try {
        await deletePost({ postId })

        toast.success("Votre publication a été supprimé")
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
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="ghost">
          <Ellipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1" side="right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              Supprimer la publication
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Etes-vous absolument sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera
                définitivement votre publication.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={deleteHandler} disabled={isPending}>
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Supprimer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PopoverContent>
    </Popover>
  )
}
