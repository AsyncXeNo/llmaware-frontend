'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { RxCross2 } from 'react-icons/rx'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function TagsManager({ initialTags }) {
    const [tags, setTags] = useState(initialTags)
    const [newTagName, setNewTagName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(null)

    const handleAddTag = async (e) => {
        e.preventDefault()
        
        if (!newTagName.trim()) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const { data, error } = await supabase
                .from('tags')
                .insert([{ name: newTagName.trim() }])
                .select()
                
            if (error) throw error
            
            setTags([...tags, data[0]])
            setNewTagName('')
        } catch (err) {
            console.error('Error adding tag:', err)
            setError('Failed to add tag. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleDeleteTag = async (tagId) => {
        setShowConfirmation(null)
        setIsLoading(true)
        setError(null)
        
        try {
            const { error } = await supabase
                .from('tags')
                .delete()
                .eq('id', tagId)
                
            if (error) throw error
            
            setTags(tags.filter(tag => tag.id !== tagId))
        } catch (err) {
            console.error('Error deleting tag:', err)
            setError('Failed to delete tag. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }
    
    return (
        <div className="space-y-6 font-poppins">
            {/* Add new tag form */}
            <form onSubmit={handleAddTag} className="flex gap-4 items-center">
                <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New Tag"
                    className="px-[15px] py-[8px] bg-dark border border-white/[0.3] text-white flex-1 focus:outline-none focus:border-white"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newTagName.trim()}
                    className="px-[15px] py-[8px] bg-dark hover:bg-blue text-blue hover:text-white border border-blue font-medium cursor-pointer disabled:opacity-50"
                >
                    Add Tag
                </button>
            </form>
            
            {error && (
                <div className="text-orange border border-orange font-medium px-[15px] py-[8px]">
                    {error}
                </div>
            )}
            
            {/* Display tags */}
            <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                    <div
                        key={tag.id}
                        className="relative px-[50px] bg-dark border border-orange text-orange"
                    >
                        <div className="flex items-center justify-center py-[6px]">
                            <span className="text-center w-full">{tag.name}</span>
                        </div>
                        <button
                            onClick={() => setShowConfirmation(tag.id)}
                            className="absolute top-1/2 right-[10px] transform -translate-y-1/2 text-orange hover:text-orange cursor-pointer flex items-center justify-center"
                            aria-label={`Delete ${tag.name}`}
                        >
                            <RxCross2 size={22} />
                        </button>
                        
                        {/* Confirmation dialog */}
                        {showConfirmation === tag.id && (
                            <div className="fixed inset-0 flex items-center justify-center bg-dark/50 z-50">
                                <div className="bg-dark border border-blue px-[20px] py-[30px] max-w-md w-full flex flex-col gap-[20px]">
                                    <h4 className="text-xl text-blue font-roboto font-bold">CONFIRM DELETION</h4>
                                    <p className="text-white">
                                        Are you sure you want to delete the tag <strong className='text-blue'>"{tag.name}"</strong>?
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowConfirmation(null)}
                                            className="px-[10px] py-[6px] bg-dark border border-blue text-blue cursor-pointer hover:bg-blue hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTag(tag.id)}
                                            className="px-[10px] py-[6px] bg-dark border border-orange text-orange cursor-pointer hover:bg-orange hover:text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {tags.length === 0 && (
                    <p className="text-gray-400 italic">No tags created yet.</p>
                )}
            </div>
        </div>
    )
}