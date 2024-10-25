import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import backgroundSignup from "@/public/images/background-signup.jpg"
import { SignUp } from "@clerk/nextjs"
import { Loader, LoaderCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const SignUpPage = () => {
  return (
    <>
      <div className="container relative grid h-screen p-5 lg:max-w-none lg:grid-cols-2">
        {/* Côté gauche desktop */}
        <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
          {/* <div className="absolute inset-0 bg-zinc-900" /> */}
          <Image
            src={backgroundSignup}
            alt="Description of the image"
            placeholder="blur"
            style={{ objectFit: "cover" }}
            className="absolute inset-0 rounded-xl bg-zinc-900"
            priority
            fill
          />

          <div className="relative z-20 flex items-center text-3xl font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            FanTribe
          </div>

          <Link
            href="/auth/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "absolute right-4 top-4 z-20 text-lg md:right-8 md:top-8",
            )}
          >
            Se connecter
          </Link>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Un outil formidable pour connecter avec les fans et
                monétiser efficacement ma créativité à travers des contenus
                uniques.&rdquo;
              </p>
              <footer className="text-sm">Léandra Njoya</footer>
            </blockquote>
          </div>
        </div>

        {/* Côté droit desktop ou version mobile */}
        <div className="lg:p-0">
          <div className="flex h-full w-full flex-col items-center justify-center pb-4">
            <div className="relative z-20 flex items-center text-3xl font-semibold lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              FanTribe
            </div>

            <h1 className="mb-5 max-w-lg text-center text-3xl font-medium tracking-tight max-lg:mt-4 lg:text-4xl">
              <span className="text-primary">Inscrivez-vous</span> pour soutenir
              vos créateurs préférés
            </h1>

            {/* Spinner en dessous du formulaire de Clerk car ce dernier prend du temps à charger */}
            <div className="relative flex min-h-[535px] w-11/12 justify-center">
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <Loader size={52} className="animate-spin" />
              </div>
              <SignUp path="/auth/sign-up" forceRedirectUrl={"/onboarding"} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUpPage
