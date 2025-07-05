import { getAuthToken } from "@/app/auth"
import { NotificationsLayout } from "@/components/notifications/notification-layout"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

const NotificationsPage = async () => {
  const token = await getAuthToken()

  return (
    <>
      <NotificationsLayout />
      <SuggestionSidebar />
    </>
  )
}

export default NotificationsPage
