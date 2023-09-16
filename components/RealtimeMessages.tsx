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

  // Common pattern to trigger a re-render
  // when local state depends on prop. Otherwise, nothing happens when
  // the prop changes.
  useEffect(() => {
    setMessages(serverMessages)
  }, [serverMessages, setMessages])

  useEffect(() => {
    const channel = supabaseClient
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as ServerMessage

          // Add the message to the UI if it doesn't exist yet, (typically,
          // to avoid duplication in the sender's UI in case of optimistic UI)
          if (!messages.find((message) => message.id === newMessage.id)) {
            setMessages([...messages, newMessage])
          }
        },
      )
      .subscribe()

    // Cleanup the resource
    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [messages, setMessages, supabaseClient])

  return <pre>{JSON.stringify(messages, null, 2)}</pre>
}
