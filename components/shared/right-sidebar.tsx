"use client"

import { SuggestionCard } from "@/components/shared/suggestion-card"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Search } from "lucide-react"

export const RightSidebar = () => {
  const { isAuthenticated } = useConvexAuth()

  const users = useQuery(
    api.users.getUsers,
    isAuthenticated ? undefined : "skip",
  )

  const suggestedUsers = users?.filter((user) => Boolean(user.username))

  return (
    <section className="sticky top-0 flex h-screen w-[30%] flex-col items-stretch overflow-auto pl-6 pr-2 max-lg:hidden">
      <div className="mt-3">
        <div className="relative h-full w-full">
          <label
            htmlFor="searchBox"
            className="absolute left-0 top-0 flex h-full items-center justify-center p-4"
          >
            <Search />
          </label>
          <input
            id="searchBox"
            type="text"
            placeholder="Rechercher sur OnlyScam"
            className="h-full w-full rounded-xl border-none bg-muted py-4 pl-14 pr-4 outline-none"
          />
        </div>
      </div>

      <div className="my-4 flex flex-col rounded-xl">
        <h3 className="mb-4 text-xl font-bold">Suggestions</h3>

        <div>
          {(suggestedUsers || []).map((user, index) => (
            <SuggestionCard key={index} user={user} />
          ))}
        </div>
      </div>
    </section>
  )
}
