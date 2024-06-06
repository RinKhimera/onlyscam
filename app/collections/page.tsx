import { CollectionsLayout } from "@/components/collections/collections-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"

const CollectionsPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <CollectionsLayout />
        <RightSidebar />
      </div>
    </div>
  )
}

export default CollectionsPage
