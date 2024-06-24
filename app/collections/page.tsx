import { CollectionsLayout } from "@/components/collections/collections-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

const CollectionsPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <CollectionsLayout />
        <SuggestionSidebar />
      </div>
    </div>
  )
}

export default CollectionsPage
