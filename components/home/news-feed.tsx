import { CommentButton } from "@/components/home/comment-button"
import { LikeButton } from "@/components/home/like-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Bookmark, Dot, Heart, MessageCircle } from "lucide-react"
import { CldImage } from "next-cloudinary"
import React from "react"

export const NewsFeed = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const getPosts = useQuery(api.posts.getAllPosts)

  return (
    <div className="flex flex-col">
      {getPosts?.map((post) => (
        <div key={post._id} className="flex space-x-4 border-b px-4 pb-2 pt-4">
          <Avatar>
            <AvatarImage src={post.author?.image} alt={post.author?.name} />
            <AvatarFallback className="size-11">
              <div className="animate-pulse rounded-full bg-gray-500"></div>
            </AvatarFallback>
          </Avatar>
          <div className="flex w-full flex-col">
            <div className="flex items-center space-x-2 max-[500px]:flex-col max-[500px]:items-start max-[500px]:space-x-0">
              <div className="font-bold">{post.author?.name}</div>
              <div className="flex items-center space-x-1">
                <div className="text-muted-foreground">
                  @{post.author?.username}
                </div>
                <div className="text-muted-foreground">
                  <Dot />
                </div>
                <div className="text-muted-foreground">
                  {format(new Date(post._creationTime), "d MMMM", {
                    locale: fr,
                  })}
                </div>
              </div>
            </div>

            <div className="w-full text-base">
              {post.content
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </div>

            {/* <div className="text-base">
              {post.content
                .split("\n")
                .reduce((lines, line, index) => {
                  if (line.trim() === "") {
                    if (index === 0 || lines[lines.length - 1].trim() !== "") {
                      lines.push(line)
                    }
                  } else {
                    lines.push(line)
                  }
                  return lines
                }, [] as string[])
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </div> */}

            <>
              {post.medias.map((media) => {
                return (
                  <CldImage
                    key={media}
                    src={media}
                    alt={""}
                    width={500}
                    height={500}
                    // fill
                    // crop={"thumb"}
                    // gravity="center"
                    sizes="(max-width: 768px) 100vw,
                           (max-width: 1200px) 50vw,
                           33vw"
                    loading="lazy"
                    placeholder="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                    // blurDataURL={base64}
                    className="mt-2 max-h-[550px] rounded-md object-cover"
                  />
                )
              })}
            </>

            <div className="-ml-[5px] mt-2 flex w-full items-center justify-between">
              <div className="flex w-full items-center space-x-2">
                <LikeButton
                  postId={post._id}
                  postLikes={post.likes}
                  currentUserId={currentUser._id}
                />
                <CommentButton postId={post._id} />
              </div>

              <button className="rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500">
                <Bookmark size={20} />
              </button>
            </div>

            <div className="mb-1.5 text-sm font-semibold tracking-tight">
              {post.likes.length} j&apos;aime
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
