"use client"

import { Button } from "@/components/ui/button"
import { CldUploadWidget } from "next-cloudinary"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import Textarea from "react-expanding-textarea"
import { v4 as uuidv4 } from "uuid"

export const ExploreLayout = async () => {
  const router = useRouter()

  const fetchData = async () => {
    const depositId = uuidv4()

    const resp = await fetch(
      `https://api.sandbox.pawapay.cloud/v1/widget/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAWAPAY_SANDBOX_API_TOKEN}`,
        },
        body: JSON.stringify({
          depositId: depositId,
          returnUrl: "https://onlyscam.vercel.app/notifications",
          statementDescription: "Note of 4 to 22 chars",
          amount: "100",
          msisdn: "233593456789",
          country: "ZMB",
          reason: "Ticket to festival",
        }),
      },
    )

    const data = await resp.json()
    console.log(data, depositId)

    // router.push(data.redirectUrl)
  }

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Explorer
      </h1>
      <Textarea
        className="textarea"
        defaultValue="Lorem ipsum dolor sit amet, ..."
        id="my-textarea"
        name="pet[notes]"
        placeholder="Enter additional notes..."
      />

      <CldUploadWidget
        uploadPreset="post-videos"
        signatureEndpoint="/api/sign-cloudinary-params"
        options={{
          sources: ["local", "google_drive", "url", "camera"],
          publicId: "profile_buddies204",
        }}
        onSuccess={(result, { widget }) => {
          console.log(result?.info) // { public_id, secure_url, etc }
          widget.close()
        }}
      >
        {({ open }) => {
          return (
            <button className="w-fit bg-red-50/50" onClick={() => open()}>
              Upload an Image
            </button>
          )
        }}
      </CldUploadWidget>

      <Button onClick={fetchData}>Payer</Button>
    </main>
  )
}
