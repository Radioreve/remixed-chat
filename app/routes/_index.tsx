import { Form, Link, useLoaderData, useRevalidator } from "@remix-run/react"
import { getSupabaseServerClient } from "../../utils/supabaseServerClient"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import Authentication from "../../components/Authentication"
import RealtimeMessages from "../../components/RealtimeMessages"

export const action = async ({ request }: ActionArgs) => {
  const response = new Response()
  const supabaseServerClient = getSupabaseServerClient(request, response)
  const { message } = Object.fromEntries(await request.formData())

  const { error } = await supabaseServerClient
    .from("messages")
    .insert({ content: String(message) })

  if (error) {
    console.log(error)
  }

  return json(null, {
    headers: response.headers,
  })
}

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response()
  const supabaseServerClient = getSupabaseServerClient(request, response)
  const { data } = await supabaseServerClient.from("messages").select()

  return json(
    { messages: data ?? [] },
    {
      headers: response.headers,
    },
  )
}

export default function _index() {
  const { messages } = useLoaderData<typeof loader>()

  const revalidator = useRevalidator()

  function refresh() {
    revalidator.revalidate()
  }

  return (
    <>
      <header style={{ display: "flex" }}>
        <Authentication />
        <button onClick={refresh}>Refresh loader</button>
        <Link to="about" style={{ marginLeft: "auto" }}>
          About
        </Link>
      </header>
      <RealtimeMessages serverMessages={messages} />
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </Form>
    </>
  )
}
