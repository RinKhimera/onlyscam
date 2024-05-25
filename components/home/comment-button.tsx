import { Button } from "@/components/ui/button"
import { Id } from "@/convex/_generated/dataModel"
import { MessageCircle } from "lucide-react"

export const CommentButton = ({ postId }: { postId: Id<"posts"> }) => {
  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className="size-8 rounded-full hover:bg-blue-600/15 hover:text-blue-500"
    >
      <MessageCircle size={20} />
    </Button>
  )
}
