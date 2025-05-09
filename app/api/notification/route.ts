import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { CinetPayResponse } from "@/types"
import { fetchAction } from "convex/nextjs"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const transactionId = params.get("cpm_trans_id")
    const siteId =
      params.get("cpm_site_id") || process.env.NEXT_PUBLIC_CINETPAY_SITE_ID!
    const metadataStr = params.get("cpm_custom")

    if (!transactionId || !siteId) {
      return Response.json({ error: "Missing parameters" }, { status: 400 })
    }

    // Parser les métadonnées JSON
    let creatorId: Id<"users"> | undefined
    let subscriberId: Id<"users"> | undefined

    if (metadataStr) {
      try {
        const metadataObj = JSON.parse(metadataStr)
        creatorId = metadataObj.creatorId as Id<"users">
        subscriberId = metadataObj.subscriberId as Id<"users">

        console.log("Metadata parsed:", { creatorId, subscriberId })
      } catch (e) {
        console.error("Error parsing metadata:", e)
        // Continuer l'exécution même si le parsing échoue
      }
    }

    // Prépare le payload pour CinetPay
    const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY!
    if (!apiKey) {
      return Response.json(
        { error: "CinetPay API key not configured" },
        { status: 500 },
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
      return Response.json(
        { error: "CinetPay API error", status: checkRes.status },
        { status: 502 },
      )
    }

    const checkData: CinetPayResponse = await checkRes.json()

    // Vérification que le paiement est réussi et qu'on a au moins le creatorId
    if (checkData.code === "00" || checkData.code === "662") {
      // Extraire le montant du paiement et autres données utiles
      const amountPaid = checkData.data.amount
        ? Number(checkData.data.amount)
        : undefined

      // Utilise l'action pour traiter le paiement
      const result = await fetchAction(api.internalActions.processPayment, {
        transactionId,
        creatorId: creatorId!,
        subscriberId: subscriberId!,
        startDate: new Date().toISOString(),
        amountPaid,
      })

      return Response.json(
        {
          message: result.alreadyExists
            ? "Transaction already processed"
            : "Transaction processed successfully",
          result,
          paymentDetails: {
            amount: checkData.data.amount,
            currency: checkData.data.currency,
            paymentDate: checkData.data.payment_date,
            status: checkData.code,
          },
        },
        { status: 200 },
      )
    }

    // Paiement refusé ou autre statut
    return Response.json(
      {
        message: "Payment verification failed",
        code: checkData.code,
        description: checkData.message || "Unknown status",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Webhook error:", error)
    return Response.json(
      { error: "Webhook error POST", details: error?.message || String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  return Response.json(
    { message: "API Notify URL is healthy and running" },
    { status: 200 },
  )
}
