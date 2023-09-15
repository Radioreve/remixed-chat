import type { ReactNode } from "react"
import { useOutletContext } from "react-router"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../db_types"

export default function Authentication() {
  return (
    <>
      <Login>Login with GitHub</Login>
      <Logout>Logout</Logout>
    </>
  )
}

function Login({ children }: { children: ReactNode }) {
  const supabaseClient = useOutletContext<SupabaseClient<Database>>()

  async function handleLogin() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
    })

    if (error) {
      console.log(error)
    }
  }

  return <button onClick={handleLogin}>{children}</button>
}

function Logout({ children }: { children: ReactNode }) {
  const supabaseClient = useOutletContext<SupabaseClient<Database>>()

  async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut()

    if (error) {
      console.log(error)
    }
  }

  return <button onClick={handleLogout}>{children}</button>
}
