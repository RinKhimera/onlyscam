import { MainLayout } from "@/components/home/main-layout"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"

export default async function Home() {
  return (
    <>
      <MainLayout />
      <SuggestionSidebar />
    </>
  )
}
