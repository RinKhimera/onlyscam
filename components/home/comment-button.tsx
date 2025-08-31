"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type CommentButtonProps = {
  onToggleComments: () => void
  isCommentsOpen: boolean
  disabled?: boolean
}

export const CommentButton = ({
  onToggleComments,
  isCommentsOpen,
  disabled = false,
}: CommentButtonProps) => {
  const handleClick = () => {
    if (disabled) return
    onToggleComments()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`size-8 rounded-full transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : isCommentsOpen
            ? "bg-blue-600/15 text-blue-500"
            : "hover:bg-blue-600/15 hover:text-blue-500"
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      <MessageCircle className="!size-[19px]" />
    </Button>
  )
}
