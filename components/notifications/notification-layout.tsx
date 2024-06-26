import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"

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
                <p
                  key={notification._id}
                  className="flex space-x-4 border-b px-4 pb-2 pt-4"
                >
                  {notification.sender?.name} a aimé votre post
                </p>
              )
            }

            if (notification.type === "comment") {
              return (
                <p
                  key={notification._id}
                  className="flex space-x-4 border-b px-4 pb-2 pt-4"
                >
                  {notification.sender?.name} a commenté votre post
                </p>
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
