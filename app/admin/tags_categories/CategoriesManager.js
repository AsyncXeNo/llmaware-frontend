'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { RxCross2 } from 'react-icons/rx'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CategoriesManager({ initialCategories }) {
    const [categories, setCategories] = useState(initialCategories)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(null)

    const handleAddCategory = async (e) => {
        e.preventDefault()
        
        if (!newCategoryName.trim()) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: newCategoryName.trim() }])
                .select()
                
            if (error) throw error
            
            setCategories([...categories, data[0]])
            setNewCategoryName('')
        } catch (err) {
            console.error('Error adding category:', err)
            setError('Failed to add category. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleDeleteCategory = async (categoryId) => {
        setShowConfirmation(null)
        setIsLoading(true)
        setError(null)
        
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId)
                
            if (error) throw error
            
            setCategories(categories.filter(category => category.id !== categoryId))
        } catch (err) {
            console.error('Error deleting category:', err)
            setError('Failed to delete category. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }
    
    return (
        <div className="space-y-6 font-poppins">
            {/* Add new category form */}
            <form onSubmit={handleAddCategory} className="flex gap-4 items-center">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category"
                    className="px-[15px] py-[8px] bg-dark border border-white/[0.3] text-white flex-1 focus:outline-none focus:border-white"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newCategoryName.trim()}
                    className="px-[15px] py-[8px] bg-dark hover:bg-blue text-blue hover:text-white border border-blue font-medium cursor-pointer disabled:opacity-50"
                >
                    Add Category
                </button>
            </form>
            
            {error && (
                <div className="text-orange border border-orange font-medium px-[15px] py-[8px]">
                    {error}
                </div>
            )}
            
            {/* Display categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="relative bg-dark border border-orange text-orange py-[12px] px-[15px]"
                    >
                        <div className="pr-8 flex items-center justify-center">
                            <span className="font-medium text-center w-full">{category.name}</span>
                        </div>
                        <button
                            onClick={() => setShowConfirmation(category.id)}
                            className="absolute top-1/2 right-[10px] transform -translate-y-1/2 text-orange hover:text-orange cursor-pointer flex items-center justify-center"
                            aria-label={`Delete ${category.name}`}
                        >
                            <RxCross2 size={22} />
                        </button>
                        
                        {/* Confirmation dialog */}
                        {showConfirmation === category.id && (
                            <div className="fixed inset-0 flex items-center justify-center bg-dark/50 z-50">
                                <div className="bg-dark border border-blue px-[20px] py-[30px] max-w-md w-full flex flex-col gap-[20px]">
                                    <h4 className="text-xl text-blue font-roboto font-bold">CONFIRM DELETION</h4>
                                    <p className="text-white">
                                        Are you sure you want to delete the category <strong className='text-blue'>"{category.name}"</strong>
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowConfirmation(null)}
                                            className="px-[10px] py-[6px] bg-dark border border-blue text-blue cursor-pointer hover:bg-blue hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
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
                
                {categories.length === 0 && (
                    <p className="text-gray-400 italic col-span-full">No categories created yet.</p>
                )}
            </div>
        </div>
    )
}