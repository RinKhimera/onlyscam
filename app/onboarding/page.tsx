import { getAuthToken } from "@/app/auth"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { UpdateImages } from "@/components/profile/update-images"
import { ImageUploadInfo } from "@/components/shared/image-upload-info"
import { Label } from "@/components/ui/label"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { redirect } from "next/navigation"

const OnboardingPage = async () => {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (currentUser?.username) redirect("/")

  return (
    <div className="container mx-auto my-4 max-w-2xl">
      <div className="mb-4">
        <div className="text-3xl font-semibold leading-none tracking-tight max-sm:text-xl">
          Finalisation de votre profil
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Veuillez compléter vos informations pour la finalisation de votre
          profil. Pas de soucis, vous pourrez les modifier à tout moment.
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <Label>Photo de bannière et de profil</Label>
        <ImageUploadInfo />
      </div>

      <UpdateImages currentUser={currentUser} />

      <OnboardingForm currentUser={currentUser} />
    </div>
  )
}

export default OnboardingPage
