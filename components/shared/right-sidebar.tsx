"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Search } from "lucide-react"
import Link from "next/link"

export const RightSidebar = () => {
  const { isAuthenticated } = useConvexAuth()
  const suggestedUsers = useQuery(
    api.users.getUsers,
    isAuthenticated ? undefined : "skip",
  )

  return (
    <section className="sticky top-0 flex h-screen w-[30%] flex-col items-stretch px-6 max-lg:hidden">
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
      <div className="my-4 flex flex-col rounded-xl bg-muted">
        <h3 className="my-4 px-4 text-xl font-bold">Suggestions</h3>
        <div>
          {(suggestedUsers || []).map((user, index) => (
            <div
              key={index}
              className="transition duration-200 last:rounded-b-xl hover:bg-muted-foreground/15"
            >
              <Link
                href={`/${user.username}`}
                className="flex h-full w-full items-center justify-between p-4"
              >
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src={user.image || "https://github.com/shadcn.png"}
                      alt={user.name}
                    />
                    <AvatarFallback>XO</AvatarFallback>
                  </Avatar>

                  <div className="text-left text-sm">
                    <div className="truncate">{user.name}</div>
                    <div className="text-muted-foreground">
                      @{user.username}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
