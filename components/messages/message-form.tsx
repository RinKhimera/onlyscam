import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Laugh, Mic, Plus, Send } from "lucide-react"
import { useState } from "react"

export const MessageForm = () => {
  const [msgText, setMsgText] = useState("")

  return (
    <div className="flex items-center gap-4 bg-muted/60 p-2">
      <div className="relative ml-2 flex gap-2">
        {/* EMOJI PICKER WILL GO HERE */}
        <Laugh className="text-gray-600 dark:text-gray-400" />
        <Plus className="text-gray-600 dark:text-gray-400" />
      </div>
      <form className="flex w-full gap-3">
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
              <Mic />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
