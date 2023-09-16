import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react"

import type { Database } from "../db_types"
import { useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@supabase/auth-helpers-remix"
import { getSupabaseServerClient } from "../utils/supabaseServerClient"

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    URL: process.env.SUPABASE_URL,
    ANON_KEY: process.env.SUPABASE_ANON_KEY,
  }

  const response = new Response()
  const supabaseServerClient = getSupabaseServerClient(request, response)
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession()

  const resp = { env, session }
  return json(resp, {
    headers: response.headers,
  })
}

export default function App() {
  const { env, session } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()
  const prevRevalidatorRef = useRef<typeof revalidator>()

  const serverAccessToken = session?.access_token

  const [supabaseBrowserClient] = useState(() =>
    createBrowserClient<Database>(env.URL!, env.ANON_KEY!),
  )

  // For debug purposes only.
  useEffect(() => {
    if (revalidator !== prevRevalidatorRef.current) {
      console.log("revalidator object has changed")
      prevRevalidatorRef.current = revalidator
    }
  }, [revalidator])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange((_, session) => {
      if (session?.access_token != serverAccessToken) {
        revalidator.revalidate()
      } else {
        console.log("Same token: " + serverAccessToken)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
    // Oddly enougn, revalidator changes at each render, thereby
    // turning this info an infinite rendering loop. No idea why.
  }, [serverAccessToken, supabaseBrowserClient.auth])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>Chatter!</title>
      </head>
      <body>
        <Outlet context={supabaseBrowserClient} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
