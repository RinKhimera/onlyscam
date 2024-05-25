import { PostLayout } from "@/components/post/post-layout"
import { UserProfileLayout } from "@/components/profile/user-profile-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { RightSidebar } from "@/components/shared/right-sidebar"

const PostDetailsPage = ({ params }: { params: { username: string } }) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <PostLayout />
        <RightSidebar />
      </div>
    </div>
  )
}

export default PostDetailsPage
