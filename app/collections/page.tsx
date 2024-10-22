import { getAuthToken } from "@/app/auth"
import { CollectionsLayout } from "@/components/collections/collections-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { redirect } from "next/navigation"

const CollectionsPage = async () => {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar currentUser={currentUser} />
        <CollectionsLayout />
        <SuggestionSidebar authToken={token} />
      </div>
    </div>
  )
}

export default CollectionsPage
