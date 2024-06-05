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
import { useMutation } from "convex/react"
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
  const router = useRouter()

  const apiURL =
    process.env.NODE_ENV === "production"
      ? "https://onlyscam.vercel.app/api/deposits"
      : "http://localhost:3000/api/deposits"

  const [isPending, startTransition] = useTransition()

  const followUser = useMutation(api.users.followUser)

  const handleFollow = () => {
    startTransition(async () => {
      try {
        const depositId = uuidv4()

        const resp = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            depositId: depositId,
            returnUrl: "https://onlyscam.vercel.app/payment-check",
            statementDescription: "Abonnement mensuel",
            amount: "500",
            // msisdn: "233593456789",
            country: "CMR",
            reason: `Abonnement mensuel Fantribe - ${userProfile?.username}`,
            metadata: [
              {
                fieldName: "creatorUsername",
                fieldValue: userProfile?.username,
              },
              {
                fieldName: "creatorId",
                fieldValue: userProfile?._id,
                isPII: true,
              },
            ],
          }),
        })

        const data = await resp.json()
        console.log(data, depositId)

        router.push(data.data.redirectUrl)

        // await followUser({
        //   creatorId: userProfile!._id,
        // })

        // toast.success("Vous suivez désormais ce createur")
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
            <div className="font-bold">500 XAF</div>
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
                  <div className="font-bold">500 XAF</div>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
