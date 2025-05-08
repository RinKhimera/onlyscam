"use client"

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
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { UserProps } from "@/types"
import { useConvexAuth, useQuery } from "convex/react"
import { Check, LoaderCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

type SubscribeDialogProps = {
  userProfile: UserProps
}

export const SubscribeDialog = ({ userProfile }: SubscribeDialogProps) => {
  const { isAuthenticated } = useConvexAuth()
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const router = useRouter()

  const [isPending, startTransition] = useTransition()

  const handleFollow = () => {
    startTransition(async () => {
      try {
        const transactionId = uuidv4()

        const metadataObj = {
          creatorId: userProfile?._id,
          subscriberId: currentUser?._id,
        }
        const metadataString = JSON.stringify(metadataObj)

        // const resp = await fetch(apiURL, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     depositId: depositId,
        //     returnUrl: "https://fantribe.io/payment-check",
        //     statementDescription: "Abonnement mensuel",
        //     amount: "500",
        //     // msisdn: "233593456789",
        //     country: "CMR",
        //     reason: `Abonnement mensuel Fantribe - ${userProfile?.username}`,
        //     metadata: [
        //       {
        //         fieldName: "creatorUsername",
        //         fieldValue: userProfile?.username,
        //       },
        //       {
        //         fieldName: "creatorId",
        //         fieldValue: userProfile?._id,
        //         isPII: true,
        //       },
        //     ],
        //   }),
        // })

        const resp = await fetch(
          "https://api-checkout.cinetpay.com/v2/payment",
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
              site_id: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
              transaction_id: transactionId,
              amount: 100,
              currency: "XAF",
              // alternative_currency: "",
              description: "Abonnement mensuel",
              // customer_id: "172",
              // customer_name: "KOUADIO",
              // customer_surname: "Francisse",
              // customer_email: "harrissylver@gmail.com",
              // customer_phone_number: "+225004315545",
              // customer_address: "Antananarivo",
              // customer_city: "Antananarivo",
              // customer_country: "CM",
              // customer_state: "CM",
              // customer_zip_code: "065100",
              notify_url: "https://fantribe.io/api/notification",
              return_url: "https://fantribe.io/api/return",
              channels: "ALL",
              metadata: metadataString,
              lang: "FR",
              invoice_data: {
                Donnee1: "",
                Donnee2: "",
                Donnee3: "",
              },
            }),
          },
        )

        const data = await resp.json()
        console.log(data)

        router.push(data.data.payment_url)
      } catch (error) {
        console.error(error)
        toast.error("Une erreur s'est produite !", {
          description:
            "Veuillez vérifier votre connexion internet et réessayer",
        })
      }
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
              onClick={handleFollow}
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
