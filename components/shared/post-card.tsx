"use client"

import { BookmarkButton } from "@/components/home/bookmark-button"
import { CommentButton } from "@/components/home/comment-button"
import { LikeButton } from "@/components/home/like-button"
import { PostEllipsis } from "@/components/home/post-ellipsis"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProfileImage } from "@/components/shared/profile-image"
import { Doc } from "@/convex/_generated/dataModel"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CldImage, CldVideoPlayer } from "next-cloudinary"
import "next-cloudinary/dist/cld-video-player.css"
import Image from "next/image"
import Link from "next/link"
import React from "react"

// ExtendedPost is a type that represents a post with an extended author field.
// It's created by taking the original Doc<"posts"> type and omitting the 'author' field.
// Then, we add back the 'author' field but this time it's of type Doc<"users"> or null.
type ExtendedPost = Omit<Doc<"posts">, "author"> & {
  author: Doc<"users"> | null
}

type PostCardProps = {
  post: ExtendedPost
  currentUser: Doc<"users">
}

export const PostCard = ({ post, currentUser }: PostCardProps) => {
  return (
    <div className="flex space-x-4 border-b px-4 pb-2 pt-4">
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between">
          <Link href={`/${post.author?.username}`}>
            <div className="flex items-center gap-3">
              <Avatar>
                {post.author?.image ? (
                  <ProfileImage
                    src={post.author.image}
                    width={100}
                    height={100}
                    alt={post.author.username || "Profile image"}
                  />
                ) : (
                  <AvatarFallback className="size-11">
                    <div className="animate-pulse rounded-full bg-gray-500"></div>
                  </AvatarFallback>
                )}
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

            <PostEllipsis postId={post._id} />
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
              const isVideo = media.startsWith(
                "https://res.cloudinary.com/onlyscam/video/",
              )
              if (isVideo) {
                return (
                  <CldVideoPlayer
                    key={media}
                    width={1620}
                    height={1080}
                    src={media}
                    sourceTypes={["hls"]}
                    logo={false}
                    transformation={{
                      streaming_profile: "hd",
                    }}
                    className="mt-2 rounded-md"
                  />
                )
              } else {
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
              }
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
            <BookmarkButton
              postId={post._id}
              currentUserBookmark={currentUser.bookmarks || []}
            />
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
  )
}
