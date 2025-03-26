export const dynamic = 'force-dynamic'

import AdminNavbar from '../components/AdminNavbar'
import { createClient } from '@supabase/supabase-js'
import AuthorsTable from './AuthorsTable'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default async function Authors() {
    const { data: authors, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching authors:', error)
    }

    return (
        <>
            <AdminNavbar />
            <div className='px-[20px] 
                      sm:px-[50px] 
                      lg:px-[144px]
                      my-[100px]
                      flex flex-col gap-[20px]'>
                <h3 className='font-roboto font-bold text-[30px] tracking-wider'>AUTHORS</h3>
                <div className='w-full border-t border-white/[0.3]' />
                <AuthorsTable authors={authors || []} />
            </div>
        </>
    )
}