"use client"

import { useConvexAuth, useQuery } from "convex/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { api } from "@/convex/_generated/api"

export const UserListsNavigationLinks = () => {
  const pathname = usePathname()
  const { isAuthenticated } = useConvexAuth()

  // Récupérer les données des abonnements et abonnés
  const followings = useQuery(
    api.follows.getCurrentUserFollowings,
    isAuthenticated ? undefined : "skip",
  )
  const followers = useQuery(
    api.follows.getCurrentUserFollowers,
    isAuthenticated ? undefined : "skip",
  )

  // Récupérer les posts associés
  const postsFromFollowings = useQuery(
    api.follows.getPostsFromFollowedUsers,
    isAuthenticated ? undefined : "skip",
  )
  const postsFromFollowers = useQuery(
    api.follows.getPostsFromFollowers,
    isAuthenticated ? undefined : "skip",
  )

  // Calculer les statistiques à partir des données récupérées
  const subscriptionStats = {
    users: followings?.length || 0,
    posts: postsFromFollowings?.length || 0,
  }

  const subscriberStats = {
    users: followers?.length || 0,
    posts: postsFromFollowers?.length || 0,
  }

  const navItems = [
    {
      href: "/user-lists/subscriptions",
      label: "Mes abonnements",
      stats: subscriptionStats,
    },
    {
      href: "/user-lists/subscribers",
      label: "Mes fans",
      stats: subscriberStats,
    },
  ]

  return (
    <nav className="flex flex-col">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`h-16 p-2 transition-colors ${
            pathname === item.href
              ? "bg-primary/20 border-l-4 border-primary text-foreground font-medium"
              : "hover:bg-muted"
          }`}
        >
          <div className="flex h-full w-full items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">
                {followings === undefined || followers === undefined
                  ? "Chargement..."
                  : `${item.stats.users} utilisateur(s) • ${item.stats.posts} posts`}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs">
                {item.label === "Mes abonnements" ? "AB" : "FA"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </nav>
  )
}
