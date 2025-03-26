'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function AdminLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        async function checkSession() {
            setLoading(true)
            const { data: session } = await supabase.auth.getSession()
            if (session.session) {
                const { data: user } = await supabase.auth.getUser()
                const { data: adminData, error } = await supabase
                    .from('admins')
                    .select('user_id')
                    .eq('user_id', user.user.id)
                    .single()
                const isAdmin = !!adminData && !error
                if (!isAdmin) {
                    await supabase.auth.signOut()
                    router.push('/admin/login')
                } else if (pathname === '/admin/login') {
                    router.push('/admin/dashboard')
                } else {
                    setLoading(false)
                }
            } else if (pathname !== '/admin/login') {
                router.push('/admin/login')
            } else {
                setLoading(false)
            }
        }
        checkSession()
    }, [router, pathname])

    
    return (
        <>
            {loading ? (
                <div className='w-full h-screen bg-dark'>
                    <div className='flex-1 flex h-full items-center justify-center'>
                        <div className='w-[40px] h-[40px] border-[5px] border-blue border-t-transparent rounded-full animate-spin' />
                    </div>
                </div>
            ) : (
                <div className='bg-dark
                                text-white 
                                min-h-screen
                                hidden lg:flex flex-1 flex-col'>
                    {children}
                </div>
            )}
        </>
    )
}