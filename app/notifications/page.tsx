import { NotificationsLayout } from "@/components/notifications/notification-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"

const NotificationsPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <NotificationsLayout />
        <RightSidebar />
      </div>
    </div>
  )
}

export default NotificationsPage
