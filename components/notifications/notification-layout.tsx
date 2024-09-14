import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { NotificationItem } from "./notification-item"

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
          {userNotifications?.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </main>
  )
}
