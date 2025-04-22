export async function POST(request: Request) {
  try {
    const response = await request.text()
    // Process the webhook payload
    console.log("Webhook received:", response)
  } catch (error: any) {
    return new Response(`Webhook error POST: ${error.message}`, {
      status: 400,
    })
  }

  return new Response("Success!", {
    status: 200,
  })
}

export async function GET() {
  return new Response("API is healthy and running", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
