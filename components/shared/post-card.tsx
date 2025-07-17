"use client"

import { useQuery } from "convex/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Lock } from "lucide-react"
import { CldImage, CldVideoPlayer } from "next-cloudinary"
import "next-cloudinary/dist/cld-video-player.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { BookmarkButton } from "@/components/home/bookmark-button"
import { CommentButton } from "@/components/home/comment-button"
import { LikeButton } from "@/components/home/like-button"
import { PostEllipsis } from "@/components/home/post-ellipsis"
import { CommentSection } from "@/components/shared/comment-section"
import { ProfileImage } from "@/components/shared/profile-image"
import { SubscriptionModal } from "@/components/shared/subscription-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"

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
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const router = useRouter()
  const isOwnPost = currentUser._id === post.author?._id
  const isMediaProtected = post.visibility === "subscribers_only"
  const hasMedia = post.medias && post.medias.length > 0

  // Vérifier le statut d'abonnement directement dans le composant
  const subscriptionStatus = useQuery(
    api.subscriptions.getFollowSubscription,
    post.author
      ? {
          creatorId: post.author._id,
          subscriberId: currentUser._id,
        }
      : "skip", // Éviter la requête si pas d'auteur
  )

  const isSubscriber = subscriptionStatus?.status === "active"

  // Logique d'accès aux médias
  const canViewMedia = isOwnPost || !isMediaProtected || isSubscriber

  const handlePostClick = (e: React.MouseEvent) => {
    // Ne navigue que si le clic n'est pas sur un élément interactif
    if (
      !(e.target as HTMLElement).closest("button") &&
      !(e.target as HTMLElement).closest("a") &&
      !(e.target as HTMLElement).closest("textarea") &&
      !(e.target as HTMLElement).closest("form")
    ) {
      // Si l'utilisateur n'a pas accès au contenu restreint
      if (!canViewMedia && post.author && !isOwnPost) {
        setIsSubscriptionModalOpen(true)
      } else {
        // Navigation normale vers la page du post
        router.push(`/${post.author?.username}/post/${post._id}`)
      }
    }
  }

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen)
  }

  return (
    <>
      <div
        className="flex cursor-pointer space-x-4 border-b px-4 pb-2 pt-4 transition-colors hover:bg-muted/10"
        onClick={handlePostClick}
      >
        <div className="flex w-full flex-col">
          <div
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
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

              <PostEllipsis
                postId={post._id}
                currentUser={currentUser}
                postAuthorId={post.author?._id}
                visibility={post.visibility || "public"}
                postAuthorUsername={post.author?.username}
              />
            </div>
          </div>

          <div className="mt-1 flex flex-col sm:ml-[52px]">
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

            {/* Media section with conditional rendering */}
            {hasMedia && (
              <>
                {canViewMedia ? (
                  // Original media rendering logic
                  <>
                    {post.medias.map((media) => {
                      const isVideo = media.startsWith(
                        "https://res.cloudinary.com/onlyscam/video/",
                      )
                      if (isVideo) {
                        return (
                          <div key={media} onClick={(e) => e.stopPropagation()}>
                            <CldVideoPlayer
                              width={1620}
                              height={1080}
                              src={media}
                              logo={false}
                              sourceTypes={["hls"]}
                              transformation={{
                                streaming_profile: "hd",
                              }}
                              className="mt-2 rounded-md"
                            />
                          </div>
                        )
                      } else {
                        return (
                          <CldImage
                            key={media}
                            src={media}
                            alt={""}
                            width={500}
                            height={500}
                            className="mt-2 max-h-[550px] rounded-md object-cover"
                          />
                        )
                      }
                    })}
                  </>
                ) : (
                  // Locked media placeholder
                  <div className="mt-2 flex aspect-video w-full flex-col items-center justify-center rounded-md bg-muted/20 p-6">
                    <div className="mb-3 rounded-full bg-background/90 p-3">
                      <Lock className="size-6 text-primary" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">
                      Contenu exclusif
                    </h3>
                    <p className="mb-4 text-center text-sm text-muted-foreground">
                      Ce contenu est réservé aux abonnés de @
                      {post.author?.username}
                    </p>
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsSubscriptionModalOpen(true)
                      }}
                    >
                      S&apos;abonner pour voir
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="-ml-[5px] mt-2 flex w-full items-center justify-between">
              <div className="flex w-full items-center space-x-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton
                    postId={post._id}
                    postLikes={post.likes}
                    currentUserId={currentUser._id}
                    disabled={!canViewMedia}
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <CommentButton
                    onToggleComments={toggleComments}
                    isCommentsOpen={isCommentsOpen}
                    disabled={!canViewMedia}
                  />
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <BookmarkButton
                  postId={post._id}
                  currentUserBookmark={currentUser.bookmarks || []}
                  disabled={!canViewMedia}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold tracking-tight">
                {post.likes.length > 0 && (
                  <span>{post.likes.length} j&apos;aime</span>
                )}

                {post.comments && post.comments.length > 0 && (
                  <>
                    {post.likes.length > 0 && <span>•</span>}
                    <span>
                      {post.comments.length} commentaire
                      {post.comments.length > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Section des commentaires */}
            <CommentSection
              postId={post._id}
              currentUser={currentUser}
              isOpen={isCommentsOpen}
              disabled={!canViewMedia}
            />
          </div>
        </div>
      </div>

      {/* Modale d'abonnement */}
      {post.author && (
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          creator={post.author}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
