'use client'

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import Notification from '@/components/notification/Notification'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function EditAuthorForm({ author }) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: author.name,
        description: author.description || '',
        slug: author.slug
    })
    const [file, setFile] = useState(null)
    const [notification, setNotification] = useState('')
    const [showNotification, setShowNotification] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)


    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsUpdating(true)

        try {
            let profilePictureUrl = author.profile_picture_url
            
            const isValidSlug = /^[a-zA-Z-]+$/.test(formData.slug)

            if (!isValidSlug) {
                throw Error('slug can only contains english alphabets and hyphens')
            }

            if (file) {
                
                if (profilePictureUrl) {
                    const oldFileName = profilePictureUrl.split('/').pop()
                    await supabase.storage
                        .from('llmaware')
                        .remove([oldFileName])
                }

                const fileExt = file.name.split('.').pop()
                const fileName = `${formData.slug}-${Date.now()}.${fileExt}`
                const { data, error: uploadError } = await supabase.storage
                    .from('llmaware')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('llmaware')
                    .getPublicUrl(fileName)

                profilePictureUrl = publicUrlData.publicUrl
            }

            const { error } = await supabase
                .from('authors')
                .update({ ...formData, profile_picture_url: profilePictureUrl })
                .eq('id', author.id)

            if (error) throw error

            setNotification('Author updated successfully!')
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
                router.refresh()
            }, 5000)

        } catch (error) {
            setNotification('Error updating author: ' + error.message)
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)
            console.error('Error updating author:', error)

        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this author? This will also remove their profile picture.')) return

        setIsDeleting(true)

        try {

            if (author.profile_picture_url) {
                const fileName = author.profile_picture_url.split('/').pop()
                const { error: storageError } = await supabase.storage
                    .from('llmaware')
                    .remove([fileName])

                if (storageError) throw storageError
            }

            const { error } = await supabase
                .from('authors')
                .delete()
                .eq('id', author.id)

            if (error) throw error

            router.push('/admin/authors')

        } catch (error) {

            setNotification('Error deleting author: ' + error.message)
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)
            console.error('Error deleting author:', error)

        } finally {
            setIsDeleting(false)
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
        <div className='font-poppins'>
            {showNotification && (
                <Notification notificationText={notification} />
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
                        className='p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue min-h-[100px]'
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
                    {author.profile_picture_url && (
                        <div className='mt-2'>
                            <p className='text-white text-sm'></p>
                            <a href={author.profile_picture_url} target='_blank' rel='noopener noreferrer'>
                                <img
                                    src={author.profile_picture_url}
                                    alt='Current profile'
                                    className='w-16 h-16 object-cover'
                                />
                            </a>
                        </div>
                    )}
                </div>
                <div className='flex gap-[10px] mt-[20px]'>
                    <Link
                        href='/admin/authors'
                        className={`px-[20px] py-[6px] border border-white text-white font-medium hover:text-dark hover:bg-white cursor-pointer`}
                    >
                        Back
                    </Link>
                    <button
                        type='submit'
                        disabled={isUpdating}
                        className={`px-[20px] py-[6px] border border-blue text-blue font-medium ${isUpdating ? 'opacity-50 hover:bg-transparent hover:text-blue cursor-not-allowed' : 'hover:text-white hover:bg-blue cursor-pointer'
                            }`}
                    >
                        Update Author
                    </button>
                    <button
                        type='button'
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`px-[20px] py-[6px] border border-orange text-orange font-medium ${isDeleting ? 'opacity-50 hover:bg-transparent hover:text-orange cursor-not-allowed' : 'hover:text-white hover:bg-orange cursor-pointer'
                            }`}
                    >
                        Delete Author
                    </button>
                </div>
            </form>
        </div>
    )
}