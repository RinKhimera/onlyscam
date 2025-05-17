"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Doc } from "@/convex/_generated/dataModel"
import { ImagePlus } from "lucide-react"
import Textarea from "react-expanding-textarea"
import { useRouter } from "next/navigation"
import { CldImage } from "next-cloudinary"
import { ProfileImage } from "../shared/profile-image"

export const CreatePost = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const router = useRouter()

  const handleCreatePostClick = () => {
    router.push("/new-post")
  }

  return (
    <div
      className="relative flex cursor-pointer items-stretch space-x-3 border-b border-muted px-4 py-5 max-sm:hidden"
      onClick={handleCreatePostClick}
    >
      <Avatar>
        <ProfileImage
          src={currentUser?.image}
          width={100}
          height={100}
          alt={currentUser?.username || "Profile image"}
        />
        <AvatarFallback className="size-11">
          <div className="animate-pulse rounded-full bg-gray-500"></div>
        </AvatarFallback>
      </Avatar>

      <form className="w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full w-full flex-col">
          <Textarea
            placeholder="Partager une publication"
            className="mt-1 h-full w-full resize-none border-none bg-transparent text-xl outline-none"
            onClick={(e) => {
              e.stopPropagation()
              handleCreatePostClick()
            }}
            readOnly
          />

          <div className="mt-8 flex w-full items-center justify-between">
            {currentUser !== undefined && (
              <div className="-ml-2 text-blue-500">
                <button
                  type="button"
                  className="rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreatePostClick()
                  }}
                >
                  <ImagePlus size={20} />
                </button>
              </div>
            )}

            <Button
              className="w-fit rounded-full bg-sky-500 px-4 py-2 font-bold hover:bg-sky-600"
              onClick={(e) => {
                e.stopPropagation()
                handleCreatePostClick()
              }}
              type="button"
            >
              Publier
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
