import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://umloblqvcbifywifjetq.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_cN9wtJlrCEasNQAuyButcQ__kx3WcIu"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)