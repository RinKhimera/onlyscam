import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  PaymentData,
  handlePaymentError,
  handlePaymentSuccess,
  initializeCinetPayPayment,
} from "@/utils/cinetpayPayment"

export const usePayment = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const processPayment = async (paymentData: PaymentData) => {
    startTransition(async () => {
      const result = await initializeCinetPayPayment(paymentData)

      if (result.success && result.payment_url) {
        handlePaymentSuccess(result.payment_url, router)
      } else {
        handlePaymentError(result.error || "Erreur inconnue")
      }
    })
  }

  return {
    processPayment,
    isPending,
  }
}
