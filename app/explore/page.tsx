import { ExploreLayout } from "@/components/explore/explore-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"

const ExplorePage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <ExploreLayout />
        <RightSidebar />
      </div>
    </div>
  )
}

export default ExplorePage
