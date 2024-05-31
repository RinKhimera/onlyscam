"use client"

import { SubscribeDialog } from "@/components/profile/subscribe-dialog"
import { UnsubscribeDialog } from "@/components/profile/unsubscribe-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { notFound } from "next/navigation"

export const SubscriptionSidebar = ({
  params,
}: {
  params: { username: string }
}) => {
  const { isAuthenticated } = useConvexAuth()

  const userProfile = useQuery(api.users.getUserProfile, {
    username: params.username,
  })

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  if (userProfile === undefined || currentUser === undefined) {
    return null
  }

  if (userProfile === null) notFound()

  return (
    <section className="mt-4 flex h-screen w-[30%] flex-col items-stretch overflow-auto pl-6 pr-2 max-lg:hidden">
      <Card className="w-[350px] bg-transparent">
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>
            Abonnez-vous pour accéder à ses contenus exclusifs
          </CardDescription>
        </CardHeader>
        <CardContent className="-mt-6">
          {userProfile.followers?.includes(currentUser._id) ? (
            <UnsubscribeDialog userProfile={userProfile} />
          ) : (
            <SubscribeDialog userProfile={userProfile} />
          )}
        </CardContent>
      </Card>
    </section>
  )
}
