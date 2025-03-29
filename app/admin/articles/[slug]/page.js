'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Notification from '@/components/notification/Notification'
import AdminNavbar from '../../components/AdminNavbar'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EditArticle() {
    const params = useParams()
    const slug = params.slug
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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const { data: article, error: articleError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('slug', slug)
                    .single()

                console.log(article)

                if (articleError) throw articleError

                const { data: postTags, error: postTagsError } = await supabase
                    .from('posts_tags')
                    .select('tag_id')
                    .eq('post_id', article.id)

                if (postTagsError) throw postTagsError

                const tagIds = postTags.map((pt) => pt.tag_id)

                setFormData({
                    ...article,
                    tags: tagIds
                })

                const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
                    supabase.from('authors').select('id, name').order('name', { ascending: true }),
                    supabase.from('categories').select('id, name').order('name', { ascending: true }),
                    supabase.from('tags').select('id, name').order('name', { ascending: true })
                ])

                if (authorsRes.error) throw authorsRes.error
                setAuthors(authorsRes.data || [])

                if (categoriesRes.error) throw categoriesRes.error
                setCategories(categoriesRes.data || [])

                if (tagsRes.error) throw tagsRes.error
                setTags(tagsRes.data || [])
            } catch (error) {
                console.error('Error fetching article data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [slug])

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
            const { error: updateError } = await supabase
                .from('posts')
                .update({
                    title: formData.title,
                    category: formData.category,
                    slug: formData.slug,
                    html: formData.html,
                    time_to_read: formData.time_to_read,
                    author: formData.author,
                    published: formData.published
                })
                .eq('id', formData.id)

            if (updateError) throw updateError

            const { error: deleteTagsError } = await supabase
                .from('posts_tags')
                .delete()
                .eq('post_id', formData.id)

            if (deleteTagsError) throw deleteTagsError

            if (formData.tags.length > 0) {
                const postsTagsEntries = formData.tags.map((tagId) => ({
                    post_id: formData.id,
                    tag_id: tagId
                }))

                const { error: insertTagsError } = await supabase
                    .from('posts_tags')
                    .insert(postsTagsEntries)

                if (insertTagsError) throw insertTagsError
            }

            setNotification('Article updated successfully!')
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 3000)
            
        } catch (error) {
            console.error('Error updating article:', error)
            setNotification('Error updating article: ' + error.message)
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
                
                {loading ? (
                    <div className='w-full flex items-center justify-center py-[100px]'>
                        <div className='w-[40px] h-[40px] border-[5px] border-blue border-t-transparent rounded-full animate-spin' />
                    </div>
                ) : (
                    <>
                        <h3 className="font-roboto font-bold text-[30px] tracking-wider">articles / <span className='text-orange'>{slug}</span></h3>
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
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((category) => (
                                        <option 
                                            key={category.id} 
                                            value={category.id} 
                                            disabled={formData.category === category.id}
                                        >
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
                                <label htmlFor="html" className="text-white">Content</label>
                                <textarea
                                    id="html"
                                    name="html"
                                    value={formData.html}
                                    onChange={handleChange}
                                    className="p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue"
                                    rows="10"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-[5px]">
                                <label htmlFor="time_to_read" className="text-white">Time to Read (minutes)</label>
                                <input
                                    type="text"
                                    id="time_to_read"
                                    name="time_to_read"
                                    value={formData.time_to_read}
                                    onChange={handleChange}
                                    className="p-[10px] border border-white/[0.3] bg-transparent text-white focus:outline-none focus:border-blue"
                                    required
                                />
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
                                    <option value="" disabled>Select an author</option>
                                    {authors.map((author) => (
                                        <option 
                                            key={author.id} 
                                            value={author.id} 
                                            disabled={formData.author === author.id}
                                        >
                                            {author.name}
                                        </option>
                                    ))}
                                </select>
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
                                <label htmlFor="published" className="text-white">Published</label>
                                <input
                                    type="checkbox"
                                    id="published"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleChange}
                                    className="w-[20px] h-[20px] border border-white/[0.3] bg-transparent focus:outline-none focus:border-blue"
                                />
                            </div>
                            <div className="flex gap-[10px] mt-[20px]">
                                <button 
                                    type="button"
                                    onClick={() => window.history.back()} 
                                    className="cursor-pointer px-[15px] py-[6px] border border-white text-white hover:bg-white hover:text-dark"
                                >
                                    Back to Articles
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-[20px] py-[6px] border border-blue text-blue font-medium ${isSubmitting ? 'opacity-50 hover:bg-transparent hover:text-blue cursor-not-allowed' : 'hover:text-white hover:bg-blue cursor-pointer'}`}
                                >
                                    Update Article
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>
    )
}
