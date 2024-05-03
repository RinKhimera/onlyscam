import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { Mic, Plus, Send, Smile } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export const MessageForm = ({ currentUser }: { currentUser: any }) => {
  const params = useParams()

  const [msgText, setMsgText] = useState("")

  const sendTextMessage = useMutation(api.messages.sendTextMessage)

  const handleSendTextMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await sendTextMessage({
        content: msgText,
        conversation: params.id as Id<"conversations">,
        sender: currentUser?._id!,
      })

      setMsgText("")
    } catch (error) {
      console.error(error)
      toast.error("Event has been created", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
      })
    }
  }

  return (
    <div className="sticky bottom-0 z-10 w-full">
      <div className="flex items-center gap-4 bg-muted/60 p-2">
        <div className="relative ml-2 flex gap-2">
          {/* EMOJI PICKER WILL GO HERE */}
          <Popover>
            <PopoverTrigger>
              <Smile className="text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent
              className="w-auto"
              sideOffset={20}
              alignOffset={-17}
              align="start"
            >
              <EmojiPicker
                theme={Theme.AUTO}
                onEmojiClick={(emojiObject) => {
                  setMsgText((prev) => prev + emojiObject.emoji)
                }}
              />
            </PopoverContent>
          </Popover>

          <Plus className="text-muted-foreground" />
        </div>
        <form onSubmit={handleSendTextMessage} className="flex w-full gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message"
              className="bg-gray-tertiary w-full rounded-lg py-2 text-sm shadow-sm focus-visible:ring-transparent"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
          </div>
          <div className="mr-4 flex items-center gap-3">
            {msgText.length > 0 ? (
              <Button
                type="submit"
                size={"sm"}
                className="bg-transparent text-foreground hover:bg-transparent"
              >
                <Send />
              </Button>
            ) : (
              <Button
                type="submit"
                size={"sm"}
                className="bg-transparent text-foreground hover:bg-transparent"
              >
                <Mic className="text-muted-foreground" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
