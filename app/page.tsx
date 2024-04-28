import { MainLayout } from "@/components/home/main-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"

export default function Home() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <MainLayout />
        <RightSidebar />
      </div>
    </div>
  )
}
