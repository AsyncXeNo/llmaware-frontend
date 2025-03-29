export const dynamic = 'force-dynamic'

import AdminNavbar from '../components/AdminNavbar'
import { createClient } from '@supabase/supabase-js'
import TagsManager from './TagsManager'
import CategoriesManager from './CategoriesManager'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default async function TagsNCategories() {
    const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

    if (tagsError) {
        console.error('Error fetching tags ' + tagsError)
    }

    const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (categoryError) {
        console.error('Error fetching categories ' + categoryError)
    }

    return (
        <>
            <AdminNavbar />
            <div className='px-[20px] 
                      sm:px-[50px] 
                      lg:px-[144px]
                      my-[100px]
                      flex flex-col gap-[20px]'>
                <h3 className='font-roboto font-bold text-[30px] tracking-wider'>TAGS</h3>
                <div className='w-full border-t border-white/[0.3]' />
                <TagsManager initialTags={tags || []} />
            </div>

            <div className='px-[20px] 
                      sm:px-[50px] 
                      lg:px-[144px]
                      my-[100px]
                      flex flex-col gap-[20px]'>
                <h3 className='font-roboto font-bold text-[30px] tracking-wider'>CATEGORIES</h3>
                <div className='w-full border-t border-white/[0.3]' />
                <CategoriesManager initialCategories={categories || []} />
            </div>
        </>
    )
}