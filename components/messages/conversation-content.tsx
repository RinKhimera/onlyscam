"use client"

import { useParams } from "next/navigation"

export const ConversationContent = () => {
  const params = useParams()

  console.log(params)
  return <div>Content : {params.id} </div>
}
