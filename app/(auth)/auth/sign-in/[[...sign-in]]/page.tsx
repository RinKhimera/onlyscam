"use client"

import { SignIn } from "@clerk/nextjs"
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
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-3xl font-medium">
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
          {/* <SignIn.Root>
            <SignIn.Step name="start">
              <h1>Sign in to your account</h1>

              <Clerk.Connection name="google">
                Sign in with Google
              </Clerk.Connection>

              <Clerk.Field name="identifier">
                <Clerk.Label>Email</Clerk.Label>
                <Clerk.Input />
                <Clerk.FieldError />
              </Clerk.Field>

              <SignIn.Action submit>Continue</SignIn.Action>
            </SignIn.Step>
          </SignIn.Root> */}
        </div>
      </div>
    </>
  )
}

export default SignInPage
