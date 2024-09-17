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
import { Doc } from "@/convex/_generated/dataModel"
import { isPast } from "date-fns"

type SubscriptionSidebarProps = {
  userProfile: Doc<"users">
  subStatus: Doc<"subscriptions"> | null
}

export const SubscriptionSidebar = async ({
  userProfile,
  subStatus,
}: SubscriptionSidebarProps) => {
  return (
    <section className="sticky top-0 h-screen w-[30%] items-stretch overflow-auto pl-6 pr-2 max-lg:hidden">
      <Card className="mt-4 w-[350px] bg-transparent">
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>
            Abonnez-vous pour accéder à ses contenus exclusifs
          </CardDescription>
        </CardHeader>
        <CardContent className="-mt-6">
          {subStatus ? (
            isPast(new Date(subStatus.endDate)) ? (
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
