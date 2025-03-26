// app/admin/authors/[slug]/page.jsx
import AdminNavbar from '../../components/AdminNavbar'
import { createClient } from '@supabase/supabase-js'
import EditAuthorForm from './EditAuthorForm'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default async function EditAuthor({ params }) {
    const { slug } = await params
    const { data: author, error } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !author) {
        return (
            <>
                <AdminNavbar />
                <div className='px-[20px] sm:px-[50px] lg:px-[144px] my-[100px] flex flex-col gap-[20px]'>
                    <h3 className='font-roboto font-bold text-[30px] tracking-wider'>authors / <span className='text-orange'>{slug}</span></h3>
                    <div className='w-full border-t border-white/[0.3]' />
                    <p className='text-orange font-poppins text-[15px]'>Author not found</p>
                </div>
            </>
        )
    }

    return (
        <>
            <AdminNavbar />
            <div className='px-[20px] sm:px-[50px] lg:px-[144px] mt-[100px] flex flex-col gap-[20px]'>
                <h3 className='font-roboto font-bold text-[30px] tracking-wider'>authors / <span className='text-orange'>{slug}</span></h3>
                <div className='w-full border-t border-white/[0.3]' />
                <EditAuthorForm author={author} />
            </div>
        </>
    )
}