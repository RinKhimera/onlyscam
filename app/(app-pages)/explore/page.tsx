import { getAuthToken } from "@/app/auth"
import { ExploreLayout } from "@/components/explore/explore-layout"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

const ExplorePage = async () => {
  const token = await getAuthToken()
  return (
    <>
      <ExploreLayout />
      <SuggestionSidebar authToken={token} />
    </>
  )
}

export default ExplorePage
