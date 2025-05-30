"use client"

import { useConvexAuth, useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { UserListsCard } from "@/components/shared/user-lists-card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"

const SubscriptionsPage = () => {
  const pathname = usePathname()
  const [filter, setFilter] = useState("all")

  // Récupération des abonnements depuis Convex
  const { isAuthenticated } = useConvexAuth()
  const followings = useQuery(
    api.follows.getCurrentUserFollowings,
    isAuthenticated ? undefined : "skip",
  )

  const tabs = [
    { label: "Abonnements", path: "/user-lists/subscriptions" },
    { label: "Fans", path: "/user-lists/subscribers" },
    { label: "Bloqués", path: "/user-lists/blocked" },
  ]

  const handleFilterChange = (value: string) => {
    setFilter(value)
  }

  // Filtrer les utilisateurs selon le statut
  const getFilteredUsers = () => {
    if (!followings) return []

    // Filtrer d'abord les abonnements qui ont les détails nécessaires
    const validFollowings = followings.filter(
      (following) => following.followingDetails && following.follow,
    )

    switch (filter) {
      case "all":
        return validFollowings
      case "active":
        return validFollowings.filter(
          (following) => following.subscriptionDetails?.status === "active",
        )
      case "expired":
        return validFollowings.filter(
          (following) => following.subscriptionDetails?.status === "expired",
        )
      default:
        return []
    }
  }

  const renderContent = () => {
    // Si les données sont en cours de chargement
    if (followings === undefined) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    const filteredUsers = getFilteredUsers()

    if (filteredUsers.length === 0) {
      return (
        <div className="rounded-lg border border-muted p-4">
          <p className="text-center text-muted-foreground">
            Aucun abonnement à afficher
          </p>
        </div>
      )
    }

    return (
      <div className="@container">
        <div className="@lg:grid-cols-2 grid gap-3">
          {filteredUsers.map((following) => {
            // Le filtrage précédent garantit que followingDetails n'est pas null ici
            const details = following.followingDetails!

            return (
              <UserListsCard
                key={following.follow._id}
                user={{
                  id: details._id,
                  name: details.name,
                  username: details.username || "",
                  avatarUrl: details.image,
                  bannerUrl: details.imageBanner || "",
                }}
                isSubscribed={
                  following.subscriptionDetails?.status === "active"
                }
                onSubscribe={() =>
                  console.log(`Toggle subscription for ${details.username}`)
                }
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full justify-center p-4">
      <div className="w-full max-w-4xl">
        <Tabs defaultValue={pathname} className="mb-4 lg:hidden">
          <TabsList className="w-full">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.path}
                value={tab.path}
                asChild
                className="flex-1 data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground"
              >
                <Link href={tab.path}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select defaultValue="all" onValueChange={handleFilterChange}>
          <SelectTrigger className="mb-4 w-full">
            <SelectValue placeholder="Filtrer les abonnements" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tout</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="expired">Expirés</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {renderContent()}
      </div>
    </div>
  )
}

export default SubscriptionsPage
