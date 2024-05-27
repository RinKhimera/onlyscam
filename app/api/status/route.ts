export async function POST(req: Request) {
  const body = await req.json()
  const resp = await fetch(
    `https://api.sandbox.pawapay.cloud/deposits/${body.depositId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAWAPAY_SANDBOX_API_TOKEN}`,
      },
    },
  )

  const data = await resp.json()

  console.log(data, body)

  return Response.json({ data })
}
