import type { Database, ServerMessage } from "../db_types"
import { useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import type { SupabaseClient } from "@supabase/supabase-js"

export default function RealtimeMessages({
  serverMessages,
}: {
  serverMessages: ServerMessage[]
}) {
  const supabaseClient = useOutletContext<SupabaseClient<Database>>()
  const [messages, setMessages] = useState(serverMessages)

  useEffect(() => {
    const channel = supabaseClient
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as ServerMessage

          if (!messages.find((message) => message.id === newMessage.id)) {
            setMessages([...messages, newMessage])
          }
        },
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [messages, setMessages, supabaseClient])

  return <pre>{JSON.stringify(messages, null, 2)}</pre>
}
