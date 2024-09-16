import { getAuthToken } from "@/app/auth"
import { NotificationsLayout } from "@/components/notifications/notification-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { redirect } from "next/navigation"

const NotificationsPage = async () => {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar currentUser={currentUser} />
        <NotificationsLayout />
        <SuggestionSidebar authToken={token} />
      </div>
    </div>
  )
}

export default NotificationsPage
