"use client"

import { PaymentCheckLayout } from "@/components/payment-check/payment-check-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { Suspense } from "react"

const PaymentCheckPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <Suspense>
          <PaymentCheckLayout />
        </Suspense>
        <SuggestionSidebar />
      </div>
    </div>
  )
}

export default PaymentCheckPage
