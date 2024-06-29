import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Heart } from "lucide-react"
import Link from "next/link"

export const NotificationsLayout = () => {
  const { isAuthenticated } = useConvexAuth()

  const userNotifications = useQuery(
    api.notifications.getUserNotifications,
    isAuthenticated ? undefined : "skip",
  )

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Notifications
      </h1>

      {userNotifications?.length === 0 ? (
        <div className="mt-16 h-full px-4 text-center text-xl text-muted-foreground">
          Aucune notification pour le moment...
        </div>
      ) : (
        <div className="flex flex-col">
          {userNotifications?.map((notification) => {
            if (notification.type === "like") {
              return (
                <Link
                  key={notification._id}
                  href={`/${notification.sender?.username}/post/${notification.post?._id}`}
                  className="flex flex-col gap-2 border-b px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="text-rose-500" size={32} fill="red" />
                    <Link href={`/${notification.sender?.username}`}>
                      <Avatar className="size-9">
                        <AvatarImage
                          src={notification.sender?.image}
                          alt={notification.sender?.name}
                        />
                        <AvatarFallback className="size-11">
                          <div className="animate-pulse rounded-full bg-gray-500"></div>
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>

                  <div>
                    <Link
                      href={`/${notification.sender?.username}`}
                      className="font-semibold hover:underline"
                    >
                      {notification.sender?.name}
                    </Link>{" "}
                    a aimé votre post.
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {notification.post?.content}
                  </div>
                </Link>
              )
            }

            if (notification.type === "comment") {
              return (
                <div
                  key={notification._id}
                  className="flex space-x-4 border-b px-4 pb-2 pt-4"
                >
                  {notification.sender?.name} a commenté votre post
                </div>
              )
            }

            if (notification.type === "newSubsciption") {
              return (
                <p
                  key={notification._id}
                  className="flex space-x-4 border-b px-4 pb-2 pt-4"
                >
                  {notification.sender?.name} s&apos;est abonné à vous
                </p>
              )
            }

            if (notification.type === "renewSubscription") {
              return (
                <p
                  key={notification._id}
                  className="flex space-x-4 border-b px-4 pb-2 pt-4"
                >
                  {notification.sender?.name} a renouvelé son abonnement
                </p>
              )
            }
          })}
        </div>
      )}
    </main>
  )
}
