import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkoihckxdwnmcabbtqhi.supabase.co'
const supabaseKey = 'sb_publishable_X6U8P-a7yQTYY1VBnLlIog_F-cXrSLJ'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)