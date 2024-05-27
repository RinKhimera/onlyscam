"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { Button } from "../ui/button"

export const NotificationsLayout = () => {
  const router = useRouter()

  const apiURL =
    process.env.NODE_ENV === "production"
      ? "https://onlyscam.vercel.app/api/status"
      : "http://localhost:3000/api/status"
  const searchParams = useSearchParams()
  const depositId = searchParams.get("depositId")

  const handleClick = async () => {
    try {
      // const depositId = "2d75dd7d-6e24-42d8-96e4-f2cf7f42a9bf"

      const resp = await fetch(`${apiURL}`, {
        // Include depositId in the URL as a query parameter
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId: depositId,
        }),
      })

      const data = await resp.json()

      const status = data.data[0].status
      console.log(data)

      if (status === "COMPLETED") {
        toast.success("Votre transaction a été effectuée avec succès !")
      } else {
        toast.error("Votre transaction a échouée !", {
          description: "Veuillez réessayer plus tard",
        })
      }
    } catch (error) {
      console.error(error)
      toast.error("Une erreur s'est produite !", {
        description: "Veuillez vérifier votre connexion internet et réessayer",
      })
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
