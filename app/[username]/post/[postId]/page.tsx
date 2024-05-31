import { PostLayout } from "@/components/post/post-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"

const PostDetailsPage = ({ params }: { params: { username: string } }) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <PostLayout />
        <SubscriptionSidebar />
      </div>
    </div>
  )
}

export default PostDetailsPage
