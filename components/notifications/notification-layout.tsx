"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "../ui/button"

export const NotificationsLayout = () => {
  const searchParams = useSearchParams()
  const depositId = searchParams.get("depositId")

  const fetchData = async () => {
    const resp = await fetch(
      `https://api.sandbox.pawapay.cloud/deposits/${depositId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAWAPAY_SANDBOX_API_TOKEN}`,
        },
      },
    )

    const data = await resp.text()
    console.log(data, depositId)
  }

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Notifications
      </h1>

      <Button onClick={fetchData}>Recevoir statut</Button>
    </main>
  )
}
