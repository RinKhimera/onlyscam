import { LeftSidebar } from "@/components/shared/left-sidebar"
import { getAuthToken } from "@/app/auth"
import { fetchQuery } from "convex/nextjs"
import { redirect } from "next/navigation"
import { api } from "@/convex/_generated/api"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  return (
    <section>
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative flex h-full w-full max-w-screen-xl">
          <LeftSidebar currentUser={currentUser} />
          {children}
        </div>
      </div>
    </section>
  )
}
