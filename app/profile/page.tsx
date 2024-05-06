import { ProfileLayout } from "@/components/profile/profile-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"

export default function Home() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <ProfileLayout />
        <RightSidebar />
      </div>
    </div>
  )
}
