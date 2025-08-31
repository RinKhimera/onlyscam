import { fetchQuery } from "convex/nextjs"
import { redirect } from "next/navigation"
import { getAuthToken } from "@/app/auth"
import { PaymentCheckLayout } from "@/components/payment-check/payment-check-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"

const PaymentCheckPage = async () => {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-(--breakpoint-xl)">
        <LeftSidebar currentUser={currentUser} />
        <PaymentCheckLayout />
        <SuggestionSidebar />
      </div>
    </div>
  )
}

export default PaymentCheckPage
