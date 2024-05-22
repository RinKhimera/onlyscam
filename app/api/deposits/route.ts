import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  const body = await req.json()

  const resp = await fetch(
    `https://api.sandbox.pawapay.cloud/v1/widget/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAWAPAY_SANDBOX_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    },
  )

  const data = await resp.json()

  console.log(data)

  return Response.json({ data })
}
