import { NotificationsLayout } from "@/components/notifications/notification-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"
// import { Suspense } from "react"

const NotificationsPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        {/* <Suspense> */}
        <NotificationsLayout />
        {/* </Suspense> */}
        <RightSidebar />
      </div>
    </div>
  )
}

export default NotificationsPage
