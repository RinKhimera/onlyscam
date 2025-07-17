"use client"

import { Check, LoaderCircle } from "lucide-react"
import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePayment } from "@/hooks/useCinetpayPayment"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { cn } from "@/lib/utils"
import { UserProps } from "@/types"

type SubscribeDialogProps = {
  userProfile: UserProps
}

export const SubscribeDialog = ({ userProfile }: SubscribeDialogProps) => {
  const { currentUser } = useCurrentUser()
  const { processPayment, isPending } = usePayment()

  const handleSubscribe = () => {
    if (!currentUser || !userProfile) return

    processPayment({
      creatorId: userProfile._id,
      subscriberId: currentUser._id,
      creatorUsername: userProfile.username,
      amount: 1000,
      description: `Abonnement mensuel - ${userProfile.username}`,
      customFields: {
        type: "subscription",
        action: "subscribe",
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full justify-between rounded-3xl border-2 border-primary text-lg">
          <>
            <div>S&apos;ABONNER</div>
            <div className="font-bold">1000 XAF</div>
          </>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-5/6 max-w-md overflow-auto p-0">
        <div className="relative flex flex-col justify-evenly px-4">
          <div className="relative h-fit">
            <div>
              <AspectRatio ratio={3 / 1} className="bg-muted">
                <Image
                  className="object-cover"
                  src={
                    (userProfile?.imageBanner as string) ||
                    "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                  }
                  alt={userProfile?.name as string}
                  fill
                />
              </AspectRatio>
            </div>
            <div className="absolute -bottom-[48px] left-5 max-sm:-bottom-[38px]">
              <Avatar className="relative size-28 border-4 border-accent object-none object-center max-sm:size-24">
                <AvatarImage
                  src={userProfile?.image}
                  className="object-cover"
                />
                <AvatarFallback className="size-11">
                  <div className="animate-pulse rounded-full bg-gray-500"></div>
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <DialogTitle className="mt-5 text-center text-xl">
            Abonnez-vous et bénéficiez des avantages suivants :
          </DialogTitle>

          <DialogDescription className="text-base">
            <div className="flex gap-1">
              <Check className="shrink-0 text-primary" />
              <div>Accès complet au contenu de cet utilisateur</div>
            </div>
            <div className="flex gap-1">
              <Check className="shrink-0 text-primary" />
              <div>Message direct avec cet utilisateur</div>
            </div>
            <div className="flex gap-1">
              <Check className="shrink-0 text-primary" />
              <div>Annuler votre abonnement à tout moment</div>
            </div>
          </DialogDescription>

          <DialogFooter>
            <Button
              className={cn("w-full", "text-lg", {
                "justify-between": !isPending,
              })}
              onClick={handleSubscribe}
              disabled={isPending}
            >
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <div>S&apos;ABONNER</div>
                  <div className="font-bold">1000 XAF</div>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
