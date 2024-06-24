import { ExploreLayout } from "@/components/explore/explore-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

const ExplorePage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <ExploreLayout />
        <SuggestionSidebar />
      </div>
    </div>
  )
}

export default ExplorePage
