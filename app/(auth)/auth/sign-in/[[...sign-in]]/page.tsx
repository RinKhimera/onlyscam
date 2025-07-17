"use client"

import { SignIn } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SignInPage = () => {
  return (
    <>
      <div className="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/auth/sign-up"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8",
          )}
        >
          S&apos;inscrire
        </Link>

        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="/images/bg-login.webp"
              alt="Background"
              className="object-cover"
              priority
              fill
            />
          </div>

          {/* Overlay sombre pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-20 flex items-center text-3xl font-medium">
            <Image
              src="/images/logo.svg"
              alt="FanTribe Logo"
              width={200}
              height={200}
            />
          </div>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Plateforme intuitive et très sécurisée, parfaite pour
                partager du contenu exclusif et interagir directement avec mes
                abonnés.&rdquo;
              </p>
              <footer className="text-sm">Vanessa Elonguele</footer>
            </blockquote>
          </div>
        </div>

        <div className="lg:p-8">
          <div className="flex w-full justify-center">
            <SignIn
              path="/auth/sign-in"
              // forceRedirectUrl={"/onboarding"}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default SignInPage
