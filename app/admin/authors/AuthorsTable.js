'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FaCopy } from 'react-icons/fa'

import Notification from '@/components/notification/Notification'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function AuthorsTable({ authors }) {
    const router = useRouter()
    const [hoveredDescription, setHoveredDescription] = useState(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notification, setNotification] = useState('')
    const [deletingAuthors, setDeletingAuthors] = useState({})


    async function handleDelete(authorId) {
        if (!confirm('Are you sure you want to delete this author?')) return

        try {

            setDeletingAuthors(prev => ({ ...prev, [authorId]: true }))

            const { data: author, error: fetchError } = await supabase
                .from('authors')
                .select('profile_picture_url')
                .eq('id', authorId)
                .single()

            if (fetchError) throw fetchError

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
                .eq('id', authorId)

            if (error) throw error

            router.refresh()

            setNotification('Author deleted')
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)

            setDeletingAuthors(prev => ({ ...prev, [authorId]: false }))

        } catch (error) {

            setNotification('Error deleting author: ' + error.message)
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)
            console.error('Error deleting author:', error)

            setDeletingAuthors(prev => ({ ...prev, [authorId]: false }))

        }
    }

    const copyToClipboard = (text) => {

        navigator.clipboard.writeText(text)
            .then(() => {
                setNotification('Copied to Clipboard!')
                setShowNotification(true)
                setTimeout(() => {
                    setShowNotification(false)
                }, 5000)
            })
            .catch(err => {
                setNotification('Failed to copy')
                setShowNotification(true)
                setTimeout(() => {
                    setShowNotification(false)
                }, 5000)
                console.error('Failed to copy: ', err)
            })

    }

    return (
        <div className='relative overflow-x-auto font-poppins'>
            {hoveredDescription && (
                <div className='fixed z-50 max-w-[800px] bg-dark border border-white text-white text-[15px] p-[10px] pointer-events-none'>
                    {hoveredDescription}
                </div>
            )}
            {showNotification && (
                <Notification notificationText={notification} />
            )}
            {authors.length > 0 ? (
                <>
                    <table className='w-full border-collapse text-[15px]'>
                        <thead>
                            <tr className='bg-white text-dark'>
                                <th className='p-3 text-left font-semibold border-b'>Name</th>
                                <th className='p-3 text-left font-semibold border-b'>Description</th>
                                <th className='p-3 text-left font-semibold border-b'>Slug</th>
                                <th className='p-3 text-left font-semibold border-b'>Profile Picture</th>
                                <th className='p-3 text-left font-semibold border-b'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {authors.map((author) => (
                                <tr key={author.id} className=''>
                                    <td className='p-3 border-b'>{author.name}</td>
                                    <td className='p-3 border-b'>
                                        <div className='flex items-center gap-[15px]'>
                                            <div
                                                className='max-w-[750px] truncate flex-1'
                                                onMouseMove={(e) => {
                                                    if (author.description) {
                                                        const tooltip = document.querySelector('.fixed.z-50')
                                                        if (tooltip) {
                                                            tooltip.style.left = `${e.clientX + 10}px`
                                                            tooltip.style.top = `${e.clientY + 10}px`
                                                        }
                                                        setHoveredDescription(author.description)
                                                    }
                                                }}
                                                onMouseLeave={() => setHoveredDescription(null)}
                                            >
                                                {author.description || 'No description'}
                                            </div>
                                            {author.description && (
                                                <button
                                                    onClick={() => copyToClipboard(author.description)}
                                                    className='p-1 text-white hover:text-orange cursor-pointer'
                                                    title='Copy description'
                                                >
                                                    <FaCopy />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className='p-3 border-b'>{author.slug}</td>
                                    <td className='p-3 border-b'>
                                        {author.profile_picture_url ? (
                                            <a
                                                href={author.profile_picture_url}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                <Image
                                                    src={author.profile_picture_url}
                                                    alt={author.name}
                                                    width={32}
                                                    height={32}
                                                    className='cursor-pointer'
                                                    onError={(e) => {
                                                        e.target.src = '/default-avatar.png'
                                                    }}
                                                />
                                            </a>
                                        ) : (
                                            <span>No image</span>
                                        )}
                                    </td>
                                    <td className='p-3 border-b'>
                                        <div className='flex gap-[10px]'>
                                            <Link href={`/admin/authors/${author.slug}`}>
                                                <button className='px-[15px] py-[6px] border border-blue text-blue hover:bg-blue hover:text-white cursor-pointer'>
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(author.id)}
                                                disabled={deletingAuthors[author.id]}
                                                className={`px-[15px] py-[6px] border border-orange text-orange ${deletingAuthors[author.id] ? 'opacity-50 hover:bg-transparent hover:text-orange cursor-not-allowed' : 'hover:bg-orange hover:text-white cursor-pointer'
                                                    }`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='mt-[30px]'>
                        <Link href='/admin/authors/new'>
                            <button className='px-[20px] py-[6px] border border-blue text-blue hover:text-white hover:bg-blue cursor-pointer font-medium'>
                                Add New Author
                            </button>
                        </Link>
                    </div>
                </>
            ) : (
                <div className='text-center py-10'>
                    <p className='text-orange'>No authors found</p>
                </div>
            )}
        </div>
    )
}