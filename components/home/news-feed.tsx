import { CommentButton } from "@/components/home/comment-button"
import { LikeButton } from "@/components/home/like-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Bookmark, Dot, Ellipsis, Heart, MessageCircle } from "lucide-react"
import { CldImage } from "next-cloudinary"
import Link from "next/link"
import React from "react"

export const NewsFeed = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const getPosts = useQuery(api.posts.getAllPosts)

  return (
    <div className="flex flex-col">
      {getPosts?.map((post) => (
        <div key={post._id} className="flex space-x-4 border-b px-4 pb-2 pt-4">
          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between">
              <Link href={`/${post.author?.username}`}>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={post.author?.image}
                      alt={post.author?.name}
                    />
                    <AvatarFallback className="size-11">
                      <div className="animate-pulse rounded-full bg-gray-500"></div>
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left max-sm:text-sm">
                    <div className="font-bold">{post.author?.name}</div>
                    <div className="text-muted-foreground">
                      @{post.author?.username}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-3 text-muted-foreground">
                <>
                  {format(new Date(post._creationTime), "d MMMM", {
                    locale: fr,
                  })}
                </>

                <Ellipsis />
              </div>
            </div>

            <div className="mt-1 flex flex-col sm:ml-[52px]">
              <Link href={`/${post.author?.username}/post/${post._id}`}>
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
              </Link>

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

              <Link href={`/${post.author?.username}/post/${post._id}`}>
                {post.likes.length > 0 && (
                  <div className="mb-1.5 text-sm font-semibold tracking-tight">
                    {post.likes.length} j&apos;aime
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
