"use client"

import { Button } from "@/components/ui/button"
import { CldUploadWidget } from "next-cloudinary"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import Textarea from "react-expanding-textarea"
import { v4 as uuidv4 } from "uuid"

export const ExploreLayout = () => {
  const router = useRouter()

  const apiURL =
    process.env.NODE_ENV === "production"
      ? "https://onlyscam.vercel.app/api/deposits"
      : "http://localhost:3000/api/deposits"

  const handleClick = async () => {
    try {
      const depositId = uuidv4()

      const resp = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId: depositId,
          returnUrl: "https://onlyscam.vercel.app/notifications",
          statementDescription: "Note of 4 to 22 chars",
          amount: "500",
          // msisdn: "233593456789",
          country: "CMR",
          reason: "Abonnement mensuel Fantribe",
        }),
      })

      const data = await resp.json()
      console.log(data, depositId)

      router.push(data.data.redirectUrl)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Explorer
      </h1>

      <Button onClick={handleClick}>Payer</Button>
    </main>
  )
}
