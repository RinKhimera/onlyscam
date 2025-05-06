import { getAuthToken } from "@/app/auth"
import { CollectionsLayout } from "@/components/collections/collections-layout"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

const CollectionsPage = async () => {
  const token = await getAuthToken()

  return (
    <>
      <CollectionsLayout />
      <SuggestionSidebar authToken={token} />
    </>
  )
}

export default CollectionsPage
