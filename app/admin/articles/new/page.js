'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Notification from '@/components/notification/Notification'

import AdminNavbar from '../../components/AdminNavbar'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function NewArticle() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        slug: '',
        html: '',
        time_to_read: '',
        tags: [],
        author: '',
        published: false
    })
    const [authors, setAuthors] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [notification, setNotification] = useState('')
    const [showNotification, setShowNotification] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
                supabase.from('authors').select('id, name').order('name', { ascending: true }),
                supabase.from('categories').select('id, name').order('name', { ascending: true }),
                supabase.from('tags').select('id, name').order('name', { ascending: true })
            ])

            if (authorsRes.error) console.error('Error fetching authors:', authorsRes.error)
            else setAuthors(authorsRes.data || [])

            if (categoriesRes.error) console.error('Error fetching categories:', categoriesRes.error)
            else setCategories(categoriesRes.data || [])

            if (tagsRes.error) console.error('Error fetching tags:', tagsRes.error)
            else setTags(tagsRes.data || [])
        }

        fetchData()
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleTagToggle = (tagId) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter((id) => id !== tagId)
                : [...prev.tags, tagId]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const { data: post, error: postError } = await supabase
                .from('posts')
                .insert([{
                    title: formData.title,
                    category: formData.category,
                    slug: formData.slug,
                    html: formData.html,
                    time_to_read: formData.time_to_read,
                    author: formData.author,
                    published: formData.published
                }])
                .select()
                .single()

            if (postError) throw postError

            if (formData.tags.length > 0) {
                const postsTagsEntries = formData.tags.map((tagId) => ({
                    post_id: post.id,
                    tag_id: tagId
                }))

                const { error: postsTagsError } = await supabase
                    .from('posts_tags')
                    .insert(postsTagsEntries)

                if (postsTagsError) throw postsTagsError
            }

            router.push('/admin/articles')

        } catch (error) {
            console.error('Error creating article:', error)
            setNotification('Error creating article: ' + error.message)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <AdminNavbar />
            <div className="px-[20px] sm:px-[50px] lg:px-[144px] my-[100px] font-poppins">
                {showNotification && <Notification notificationText={notification} />}
                <h3 className="font-roboto font-bold text-[30px] tracking-wider">ADD NEW ARTICLE</h3>
                <div className="w-full border-t border-white/[0.3] my-[20px]" />
                <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="title" className="text-white">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="category" className="text-white">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="p-[10px] border border-white/[0.3] bg-dark text-white focus:outline-none focus:border-blue"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="slug" className="text-white">Slug</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="html" className="text-white">HTML Content</label>
                        <textarea
                            id="html"
                            name="html"
                            value={formData.html}
                            onChange={handleChange}
                            className="p-[10px] border border-white/[0.3] bg-transparent text-white min-h-[100px] focus:outline-none focus:border-blue"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="time_to_read" className="text-white">Time to Read</label>
                        <input
                            type="text"
                            id="time_to_read"
                            name="time_to_read"
                            value={formData.time_to_read}
                            onChange={handleChange}
                            className="p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue"
                        />
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-white">Tags</label>
                        <div className="flex flex-wrap gap-[10px]">
                            {tags.map((tag) => (
                                <label key={tag.id} className="flex items-center gap-[5px] text-white">
                                    <input
                                        type="checkbox"
                                        checked={formData.tags.includes(tag.id)}
                                        onChange={() => handleTagToggle(tag.id)}
                                        className="w-[20px] h-[20px] border border-white/[0.3] bg-transparent focus:outline-none focus:border-blue"
                                    />
                                    {tag.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <label htmlFor="author" className="text-white">Author</label>
                        <select
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className="p-[10px] border border-white/[0.3] bg-dark text-white focus:outline-none focus:border-blue"
                            required
                        >
                            <option value="">Select an author</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-[10px]">
                        <input
                            type="checkbox"
                            id="published"
                            name="published"
                            checked={formData.published}
                            onChange={handleChange}
                            className="w-[20px] h-[20px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue"
                        />
                        <label htmlFor="published" className="text-white">Published</label>
                    </div>
                    <div className="flex gap-[10px] mt-[20px]">
                        <button 
                            type="button"
                            onClick={() => window.history.back()} 
                            className="cursor-pointer px-[20px] py-[6px] border border-white text-white hover:bg-white hover:text-dark"
                        >
                            Back to Articles
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-[20px] py-[6px] border border-blue text-blue font-medium ${isSubmitting ? 'opacity-50 hover:bg-transparent hover:text-blue cursor-not-allowed' : 'hover:text-white hover:bg-blue cursor-pointer'}`}
                        >
                            Create Article
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
