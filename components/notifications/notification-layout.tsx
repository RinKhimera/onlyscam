"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "../ui/button"

export const NotificationsLayout = () => {
  // const searchParams = useSearchParams()
  // const depositId = searchParams.get("depositId")

  // const fetchData = async () => {
  //   const resp = await fetch(
  //     `https://api.sandbox.pawapay.cloud/deposits/${depositId}`,
  //     {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAWAPAY_SANDBOX_API_TOKEN}`,
  //       },
  //     },
  //   )

  //   const data = await resp.text()
  //   console.log(data, depositId)
  // }

  const handleClick = async () => {
    try {
      const depositId = uuidv4()

      const resp = await fetch("http://localhost:3000/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      })

      const data = await resp.json()
      console.log(data.data)
    } catch (error) {
      console.error(error)
    }
  }
  // async function run() {
  //   const resp = await fetch(`https://api.sandbox.pawapay.cloud/deposits`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       // Authorization:
  //       //   "Bearer eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJkMDc2ODNlMi0yMjBhLTRlYzEtYWE3My01MzMzYTY1OGY4OGQiLCJzdWIiOiIxNDYzIiwiaWF0IjoxNzEyMTM4MTc3LCJleHAiOjIwMjc2NzA5NzcsInBtIjoiREFGLFBBRiIsInR0IjoiQUFUIn0.Cvk3wn2_apieYV3YttYIhLhmnyyB6Uf82O6OhFvx4uE",
  //     },
  //     body: JSON.stringify({
  //       depositId: "trans_237",
  //       amount: "100",
  //       currency: "XAF",
  //       correspondent: "ORANGE_CMR",
  //       payer: {
  //         type: "MSISDN",
  //         address: { value: "237693456789" },
  //       },
  //       customerTimestamp: "2020-02-21T17:32:28Z",
  //       statementDescription: "Note of 4 to 22 chars",
  //     }),
  //   })

  //   const data = await resp.json()
  //   console.log(data)
  // }

  // run()

  return <Button onClick={handleClick}>Make Request</Button>

  // return (
  //   <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
  //     <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
  //       Notifications
  //     </h1>

  //     <Button onClick={fetchData}>Recevoir statut</Button>
  //   </main>
  // )
}
