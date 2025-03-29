'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Notification from '@/components/notification/Notification'

import AdminNavbar from '../components/AdminNavbar'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PostsPage() {
    const [posts, setPosts] = useState([])
    const [featuredPosts, setFeaturedPosts] = useState([null, null, null])
    const [notification, setNotification] = useState('')
    const [showNotification, setShowNotification] = useState(false)
    const [sortOption, setSortOption] = useState('recent') // 'recent' or 'views'
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPosts()
    }, [])

    async function fetchPosts() {
        setLoading(true)
        try {
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })

            if (postsError) throw postsError

            const postsWithDetails = await Promise.all(
                postsData.map(async (post) => {
                    // Get category
                    const { data: categoryData, error: categoryError } = await supabase
                        .from('categories')
                        .select('name')
                        .eq('id', post.category)
                        .single()

                    if (categoryError) throw categoryError

                    // Get tags
                    const { data: postTags, error: postTagsError } = await supabase
                        .from('posts_tags')
                        .select('tag_id')
                        .eq('post_id', post.id)

                    if (postTagsError) throw postTagsError

                    const tagIds = postTags.map((pt) => pt.tag_id)

                    const { data: tags, error: tagsError } = await supabase
                        .from('tags')
                        .select('name')
                        .in('id', tagIds)

                    if (tagsError) throw tagsError

                    // Get view count
                    const { data: viewsData, error: viewsError, count } = await supabase
                        .from('post_views')
                        .select('*', { count: 'exact' })
                        .eq('post_id', post.id)

                    if (viewsError) throw viewsError

                    return {
                        ...post,
                        category_name: categoryData?.name || 'Uncategorized',
                        tags: tags.map((tag) => tag.name),
                        created_at: new Date(post.created_at).toLocaleString(),
                        last_updated_at: new Date(post.last_updated_at).toLocaleString(),
                        view_count: count || 0
                    }
                })
            )

            setPosts(postsWithDetails)

            const { data: featuredData, error: featuredError } = await supabase
                .from('featured_posts')
                .select('*')
                .order('position', { ascending: true })

            if (featuredError) throw featuredError

            const featured = Array(3).fill(null)
            featuredData.forEach((item) => {
                featured[item.position - 1] = item.post_id
            })
            setFeaturedPosts(featured)
        } catch (error) {
            console.error('Error fetching posts or tags:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)

            if (error) throw error

            setPosts((prev) => prev.filter((post) => post.id !== postId))
            setNotification('Post deleted successfully')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        } catch (error) {
            console.error('Error deleting post:', error)
            setNotification('Error deleting post')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        }
    }

    async function handleFeatureSelect(slot, postId) {
        try {
            const { error } = await supabase
                .from('featured_posts')
                .upsert({ position: slot + 1, post_id: postId })

            if (error) throw error

            setFeaturedPosts((prev) => {
                const updated = [...prev]
                updated[slot] = postId
                return updated
            })
            setNotification('Featured post updated')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        } catch (error) {
            setNotification('Error updating featured post')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        }
    }

    async function handleFeatureDelete(slot) {
        if (!confirm('Are you sure you want to remove this featured post?')) return

        try {
            const { error } = await supabase
                .from('featured_posts')
                .delete()
                .eq('position', slot + 1)

            if (error) throw error

            setFeaturedPosts((prev) => {
                const updated = [...prev]
                updated[slot] = null
                return updated
            })

            setNotification('Featured post removed successfully')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        } catch (error) {
            console.error('Error removing featured post:', error)
            setNotification('Error removing featured post')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        }
    }

    const handleSortChange = (option) => {
        setSortOption(option);
        
        // Sort posts based on the selected option
        const sortedPosts = [...posts];
        if (option === 'recent') {
            sortedPosts.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
        } else if (option === 'views') {
            sortedPosts.sort((a, b) => b.view_count - a.view_count);
        }
        
        setPosts(sortedPosts);
    };

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
                        {/* Featured Posts Section */}
                        <div className="mb-[100px]">
                            <h3 className="font-roboto font-bold text-[30px] tracking-wider">FEATURED POSTS</h3>
                            <div className="w-full border-t border-white/[0.3] my-[20px]" />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
                                {featuredPosts.map((postId, index) => (
                                    <div key={index} className="p-[20px] border border-white/[0.3] bg-orange text-white">
                                        <p className="mb-[10px] text-black font-semibold text-[20px]">Position {index + 1}</p>
                                        <select
                                            value={postId || ''}
                                            onChange={(e) => handleFeatureSelect(index, e.target.value)}
                                            className="w-full p-[10px] bg-black border border-white/[0.3] focus:outline-none text-white"
                                        >
                                            <option value="">Select a post</option>
                                            {posts.map((post) => (
                                                <option key={post.id} value={post.id}>
                                                    {post.slug}
                                                </option>
                                            ))}
                                        </select>
                                        {postId && (
                                            <button
                                                onClick={() => handleFeatureDelete(index)}
                                                className="mt-[10px] px-[15px] py-[6px] border border-orange text-orange hover:bg-orange hover:text-white cursor-pointer w-full"
                                            >
                                                Remove Featured Post
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All Posts Section */}
                        <div>
                            <h3 className="font-roboto font-bold text-[30px] tracking-wider">ALL POSTS</h3>
                            <div className="w-full border-t border-white/[0.3] my-[20px]" />
                            
                            <div className="flex justify-between items-center mb-[20px]">
                                <Link href="/admin/articles/new">
                                    <button className="px-[20px] py-[6px] border border-blue text-blue hover:bg-blue hover:text-white font-medium cursor-pointer">
                                        Add New Post
                                    </button>
                                </Link>
                                
                                <div className="flex items-center gap-4">
                                    <span className="text-white">Sort by:</span>
                                    <div className="flex bg-dark border border-white/[0.3] text-white">
                                        <button 
                                            className={`cursor-pointer px-[15px] py-[6px] ${sortOption === 'recent' ? 'bg-blue text-white' : ''}`}
                                            onClick={() => handleSortChange('recent')}
                                        >
                                            Recent
                                        </button>
                                        <button 
                                            className={`cursor-pointer px-[15px] py-[6px] ${sortOption === 'views' ? 'bg-blue text-white' : ''}`}
                                            onClick={() => handleSortChange('views')}
                                        >
                                            Most Views
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <table className="w-full border-collapse text-[15px]">
                                <thead>
                                    <tr className="bg-white text-dark">
                                        <th className="p-3 text-left font-semibold border-b">Slug</th>
                                        <th className="p-3 text-left font-semibold border-b">Category</th>
                                        <th className="p-3 text-left font-semibold border-b">Created At</th>
                                        <th className="p-3 text-left font-semibold border-b">Last Updated At</th>
                                        <th className="p-3 text-left font-semibold border-b">Actions</th>
                                        <th className="p-3 text-left font-semibold border-b">Published</th>
                                        <th className="p-3 text-left font-semibold border-b">Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post) => (
                                        <tr key={post.id}>
                                            <td className="p-3 border-b">{post.slug}</td>
                                            <td className="p-3 border-b">{post.category_name}</td>
                                            <td className="p-3 border-b">{post.created_at}</td>
                                            <td className="p-3 border-b">{post.last_updated_at}</td>
                                            <td className="p-3 border-b">
                                                <div className="flex gap-[10px]">
                                                    <Link href={`/admin/articles/${post.slug}`}>
                                                        <button className="cursor-pointer px-[15px] py-[6px] border border-blue text-blue hover:bg-blue hover:text-white">
                                                            Edit
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="cursor-pointer px-[15px] py-[6px] border border-orange text-orange hover:bg-orange hover:text-white"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3 border-b">
                                                <div className="flex items-center">
                                                    <div className={`w-5 h-5 border border-gray-400 flex items-center justify-center ${post.published ? 'bg-blue' : 'bg-transparent'}`}>
                                                        {post.published && <span className="text-white">✓</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 border-b">{post.view_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {posts.length === 0 && <p className="text-left italic text-gray-400 mt-[20px]">No posts created yet</p>}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
