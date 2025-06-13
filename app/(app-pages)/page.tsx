import { MainLayout } from "@/components/home/main-layout"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

export default async function Home() {
  // if (!currentUser?.username) redirect("/onboarding")

  return (
    <>
      <MainLayout />
      <SuggestionSidebar />
    </>
  )
}
