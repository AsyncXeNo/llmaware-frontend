'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loggingIn, setLoggingIn] = useState(false)

    const router = useRouter()
    

    async function isAdmin() {
        const { data: user } = await supabase.auth.getUser()
        const { data: adminData, error } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', user.user.id)
            .single()
        return !!adminData && !error
    }


    async function handleLogin(e) {
        e.preventDefault()
        setLoggingIn(true)
        setMessage('')
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setMessage(`Login failed: ${error.message}`)
                setLoggingIn(false)
            } else {
                const adminCheck = await isAdmin()
                if (adminCheck) {
                    router.push('/admin/dashboard')
                } else {
                    await supabase.auth.signOut()
                    setMessage('You are not authorized as an admin.')
                    setLoggingIn(false)
                }
            }
        } catch (err) {
            setMessage(`An error occurred: ${err.message}`)
            setLoggingIn(false)
        }
    }


    return (
        <div className='min-h-screen w-screen flex items-center justify-center bg-dark'>
            <div
                className='w-[500px] min-h-[300px] py-[40px] px-[30px] bg-black 
                   border border-blue text-white flex flex-col gap-[40px] 
                   items-center justify-between shadow'
            >
                <h1 className='text-center font-roboto text-[28px] font-normal text-blue'>
                    ADMIN PORTAL LOGIN
                </h1>
                <form
                    onSubmit={handleLogin}
                    className='w-full font-poppins text-[20px] flex flex-col gap-[30px]'
                >
                    <div className='flex flex-col gap-[10px]'>
                        <label htmlFor='email' className='font-normal text-white'>
                            Email
                        </label>
                        <input
                            type='email'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loggingIn}
                            className='w-full px-[10px] py-[6px] border border-white focus:border-blue text-white focus:outline-none text-[18px] disabled:opacity-30'
                            placeholder='Enter your email'
                        />
                    </div>
                    <div className='flex flex-col gap-[10px]'>
                        <label htmlFor='password' className='font-normal text-white'>
                            Password
                        </label>
                        <input
                            type='password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loggingIn}
                            className='w-full px-[10px] py-[6px] border border-white focus:border-blue text-white focus:outline-none text-[18px] disabled:opacity-30'
                            placeholder='Enter your password'
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loggingIn}
                        className='w-fit py-[6px] px-[30px] mt-[20px] border border-blue 
                       hover:bg-blue text-blue hover:text-white 
                       disabled:hover:bg-transparent disabled:hover:text-blue
                       font-medium transition-colors duration-200
                       cursor-pointer disabled:cursor-default disabled:opacity-30
                       self-center'
                    >
                        Sign In
                    </button>
                    {message && (
                        <p className='text-center text-[18px] text-orange'>{message}</p>
                    )}
                </form>
            </div>
        </div>
    )
}