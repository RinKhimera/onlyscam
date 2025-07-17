"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Id } from "@/convex/_generated/dataModel"

type CommentButtonProps = {
  postId: Id<"posts">
  onToggleComments: () => void
  isCommentsOpen: boolean
}

export const CommentButton = ({
  postId,
  onToggleComments,
  isCommentsOpen,
}: CommentButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`size-8 rounded-full transition-colors ${
        isCommentsOpen
          ? "bg-blue-600/15 text-blue-500"
          : "hover:bg-blue-600/15 hover:text-blue-500"
      }`}
      onClick={onToggleComments}
    >
      <MessageCircle size={20} />
    </Button>
  )
}
