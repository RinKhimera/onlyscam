import { RenewDialog } from "@/components/profile/renew-dialog"
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
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { isPast } from "date-fns"
import { notFound } from "next/navigation"

type SubscriptionSidebarProps = {
  params: { username: string }
  currentUser: Doc<"users"> | undefined
  userProfile: Doc<"users"> | undefined | null
}

export const SubscriptionSidebar = ({
  params,
  currentUser,
  userProfile,
}: SubscriptionSidebarProps) => {
  const subscriptionStatus = useQuery(api.subscriptions.getFollowSubscription, {
    creatorUsername: params.username,
  })

  if (
    userProfile === undefined ||
    currentUser === undefined ||
    subscriptionStatus === undefined
  ) {
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
          {subscriptionStatus ? (
            isPast(new Date(subscriptionStatus.endDate)) ? (
              <RenewDialog userProfile={userProfile} />
            ) : (
              <UnsubscribeDialog userProfile={userProfile} />
            )
          ) : (
            <SubscribeDialog userProfile={userProfile} />
          )}
        </CardContent>
      </Card>
    </section>
  )
}
