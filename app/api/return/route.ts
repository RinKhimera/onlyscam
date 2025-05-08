import { api } from "@/convex/_generated/api"
import { CinetPayResponse } from "@/types"
import { fetchAction } from "convex/nextjs"
import { redirect } from "next/navigation"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const transactionId = params.get("transaction_id")

    // Vérification des paramètres requis
    if (!transactionId) {
      console.error("Return API: Missing transaction ID")
      return Response.redirect(
        new URL("/payment/cancelled?reason=missing_transaction", request.url),
      )
    }

    // Vérifier d'abord si la transaction existe déjà dans notre base de données
    console.log(
      `Return API: Checking if transaction ${transactionId} exists in database`,
    )
    const transactionStatus = await fetchAction(
      api.internalActions.checkTransaction,
      {
        transactionId,
      },
    )

    // Si la transaction existe déjà, rediriger directement vers la page de succès
    if (transactionStatus.exists) {
      console.log(
        `Return API: Transaction ${transactionId} found in database with status ${transactionStatus.status}`,
      )
      return Response.redirect(
        new URL(`/payment/merci?transaction=${transactionId}`, request.url),
      )
    }

    // Si la transaction n'existe pas dans notre base, vérifier avec CinetPay
    console.log(
      `Return API: Transaction ${transactionId} not found in database, checking with CinetPay`,
    )

    // Prépare le payload pour CinetPay
    const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY!
    const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID!

    if (!apiKey || !siteId) {
      console.error("Return API: Missing API key or site ID")
      return Response.redirect(
        new URL("/payment/cancelled?reason=configuration_error", request.url),
      )
    }

    const payload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
    }

    // Appel à l'API CinetPay pour vérifier le statut du paiement
    const checkRes = await fetch(
      "https://api-checkout.cinetpay.com/v2/payment/check",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )

    if (!checkRes.ok) {
      console.error(`Return API: CinetPay API error: ${checkRes.status}`)
      return Response.redirect(
        new URL("/payment/cancelled?reason=payment_check_failed", request.url),
      )
    }

    const checkData: CinetPayResponse = await checkRes.json()

    // Vérification que le paiement est réussi
    // TODO : Enlever le code 662 dans la version finale
    if (checkData.code === "00" || checkData.code === "662") {
      // Pour le retour utilisateur, nous rediriger simplement vers la page de succès
      // La notification webhook se chargera d'enregistrer la transaction
      console.log(
        `Return API: Payment successful according to CinetPay. Code: ${checkData.code}`,
      )
      return Response.redirect(
        new URL(`/payment/merci?transaction=${transactionId}`, request.url),
      )
    } else {
      // Paiement refusé ou autre statut
      console.warn(
        `Return API: Payment failed or pending: ${checkData.code} - ${checkData.message}`,
      )
      return Response.redirect(
        new URL(
          `/payment/cancelled?reason=payment_failed&code=${checkData.code}`,
          request.url,
        ),
      )
    }
  } catch (error: any) {
    // En cas d'erreur inattendue
    console.error("Return API error:", error)
    return Response.redirect(
      new URL("/payment/cancelled?reason=unexpected_error", request.url),
    )
  }
}

export async function GET() {
  return Response.json(
    { message: "API Return URL is healthy and running" },
    { status: 200 },
  )
}
