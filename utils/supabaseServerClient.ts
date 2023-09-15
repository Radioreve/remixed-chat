import type { Database } from "db_types"
import { createServerClient } from "@supabase/auth-helpers-remix"

export const getSupabaseServerClient = (request: Request, response: Response) =>
  createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response },
  )
