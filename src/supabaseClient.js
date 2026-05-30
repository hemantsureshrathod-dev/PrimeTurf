import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://utgldzqxcpvrnbxkbzdb.supabase.co';
const supabaseAnonKey = 'sb_publishable_igMGzL5QPzfuf07Tha8fCw_xPFroXmS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
