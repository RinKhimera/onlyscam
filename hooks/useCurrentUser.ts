import { useConvexAuth, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth()
  return useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )
}
