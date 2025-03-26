'use client'

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import AdminNavbar from '../../components/AdminNavbar'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function NewAuthor() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: ''
    })
    const [file, setFile] = useState(null)
    const [notification, setNotification] = useState('')
    const [showNotification, setShowNotification] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false) // Track submission state

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true) // Disable button when submission starts

        try {
            let profilePictureUrl = null

            const isValidSlug = /^[a-zA-Z-]+$/.test(formData.slug)

            if (!isValidSlug) {
                throw Error('slug can only contains english alphabets and hyphens')
            }
            
            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${formData.slug}-${Date.now()}.${fileExt}`
                const { data, error: uploadError } = await supabase.storage
                    .from('llmaware') // Replace with your bucket name
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('llmaware')
                    .getPublicUrl(fileName)

                profilePictureUrl = publicUrlData.publicUrl
            }

            const { error } = await supabase
                .from('authors')
                .insert([{ ...formData, profile_picture_url: profilePictureUrl }])

            if (error) throw error

            router.push(`/admin/authors/${formData.slug}`)
        } catch (error) {
            setNotification('Error creating author: ' + error.message)
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)
            console.error('Error creating author:', error)
        } finally {
            setIsSubmitting(false) // Re-enable button regardless of outcome
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    return (
        <>
            <AdminNavbar />
            <div className='px-[20px] sm:px-[50px] lg:px-[144px] my-[100px] flex flex-col gap-[20px] font-poppins'>
                <h3 className='font-roboto font-bold text-[30px] tracking-wider'>ADD NEW AUTHOR</h3>
                <div className='w-full border-t border-white/[0.3]' />

                {showNotification && (
                    <div className='fixed bottom-[50px] left-1/2 transform -translate-x-1/2 z-50'>
                        <div
                            className='bg-black text-orange border border-orange px-[15px] py-[7px] rounded-full animate-fade-up text-[15px] font-medium'
                            style={{
                                animation: 'fadeUp 0.3s ease-out, fadeOut 0.3s ease-in 4.7s forwards'
                            }}
                        >
                            {notification}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='flex flex-col gap-[20px]'>
                    <div className='flex flex-col gap-[5px]'>
                        <label htmlFor='name' className='text-white'>Name</label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            className='p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue'
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-[5px]'>
                        <label htmlFor='description' className='text-white'>Description</label>
                        <textarea
                            id='description'
                            name='description'
                            value={formData.description}
                            onChange={handleChange}
                            className='p-[10px] border border-white/[0.3] bg-transparent text-white min-h-[100px] focus:outline-none focus:border-blue'
                        />
                    </div>
                    <div className='flex flex-col gap-[5px]'>
                        <label htmlFor='slug' className='text-white'>Slug</label>
                        <input
                            type='text'
                            id='slug'
                            name='slug'
                            value={formData.slug}
                            onChange={handleChange}
                            className='p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue'
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-[5px]'>
                        <label htmlFor='profile_picture' className='text-white'>Profile Picture</label>
                        <input
                            type='file'
                            id='profile_picture'
                            name='profile_picture'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue'
                        />
                    </div>
                    <div className='flex gap-[10px] mt-[20px]'>
                        <Link
                            href='/admin/authors'
                            className={`px-[20px] py-[6px] border border-white text-white font-medium hover:text-black hover:bg-white cursor-pointer`}
                        >
                            Back
                        </Link>
                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className={`px-[20px] py-[6px] border border-blue text-blue font-medium self-start ${isSubmitting ? 'opacity-50 hover:bg-transparent hover:text-blue cursor-not-allowed' : 'hover:text-white hover:bg-blue cursor-pointer'
                                }`}
                        >
                            Create Author
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}