import { UserProfileLayout } from "@/components/profile/user-profile-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"

const UserProfilePage = ({ params }: { params: { username: string } }) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <UserProfileLayout params={params} />
        <SubscriptionSidebar params={params} />
      </div>
    </div>
  )
}

export default UserProfilePage
