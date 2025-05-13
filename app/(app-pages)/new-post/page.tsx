import { getAuthToken } from "@/app/auth"
import { NewPostLayout } from "@/components/new-post/new-post-layout"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

const NewPostPage = async () => {
  const token = await getAuthToken()
  return (
    <>
      <NewPostLayout />
      <SuggestionSidebar authToken={token} />
    </>
  )
}

export default NewPostPage
//
