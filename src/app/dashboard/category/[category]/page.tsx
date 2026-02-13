"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Bookmark, ExternalLink, Filter, Search } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import AuthButton from "@/components/AuthButton"
import AddBookmarkModal from "@/components/AddBookmarkModal"
import ConfirmDialog from "@/components/ConfirmDialog"

interface BookmarkItem {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  created_at: string
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | undefined>()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchBookmarks()
      } else {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchBookmarks()
        } else {
          setBookmarks([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [category])

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('category', category.charAt(0).toUpperCase() + category.slice(1))
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBookmark = async (bookmark: Omit<BookmarkItem, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          ...bookmark,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      setBookmarks(prev => [data, ...prev])
    } catch (error) {
      console.error('Error adding bookmark:', error)
    }
  }

  const handleUpdateBookmark = async (bookmark: Omit<BookmarkItem, "id" | "created_at">) => {
    if (editingBookmark?.id) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .update(bookmark)
          .eq('id', editingBookmark.id)
          .select()
          .single()

        if (error) throw error
        
        setBookmarks(prev => prev.map(b => b.id === editingBookmark.id ? data : b))
        setEditingBookmark(undefined)
      } catch (error) {
        console.error('Error updating bookmark:', error)
      }
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  const handleDeleteClick = (bookmarkId: string) => {
    setBookmarkToDelete(bookmarkId)
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = () => {
    if (bookmarkToDelete) {
      handleDeleteBookmark(bookmarkToDelete)
    }
  }

  const handleEditBookmark = (bookmark: BookmarkItem) => {
    setEditingBookmark(bookmark)
    setIsAddModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingBookmark(undefined)
  }

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      work: "blue",
      personal: "green", 
      learning: "purple",
      entertainment: "yellow",
      news: "red",
      shopping: "indigo",
      social: "pink",
      other: "gray"
    }
    return colors[cat.toLowerCase()] || "gray"
  }

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      work: "💼",
      personal: "🏠",
      learning: "📚", 
      entertainment: "🎬",
      news: "📰",
      shopping: "🛒",
      social: "👥",
      other: "📌"
    }
    return icons[cat.toLowerCase()] || "📌"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {category} bookmarks...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Smart Bookmark App</h1>
          <p className="text-gray-600 mb-8">
            Sign in to view your bookmarks
          </p>
          <div className="flex justify-center">
            <AuthButton />
          </div>
        </div>
      </div>
    )
  }

  const categoryColor = getCategoryColor(category)
  const categoryIcon = getCategoryIcon(category)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        bookmarks={bookmarks}
      />
      
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 mr-4"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-${categoryColor}-100 text-${categoryColor}-600`}>
                    {categoryIcon}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 capitalize">{category}</h1>
                    <p className="text-sm text-gray-600">{bookmarks.length} bookmarks</p>
                  </div>
                </div>
              </div>
              <AuthButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${category} bookmarks...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>Add Bookmark</span>
              </button>
            </div>

            {/* Bookmarks Grid */}
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Bookmark className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No bookmarks found' : `No ${category} bookmarks yet`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : `Start adding bookmarks to the ${category} category`
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First {category.charAt(0).toUpperCase() + category.slice(1)} Bookmark
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900 truncate flex-1">{bookmark.title}</h3>
                      <div className="flex gap-2 ml-2">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Visit link"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleEditBookmark(bookmark)}
                          className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                          title="Edit bookmark"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(bookmark.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete bookmark"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {bookmark.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bookmark.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <a 
                        href={bookmark.url} 
                        className="text-blue-600 text-sm hover:underline truncate flex-1 mr-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {bookmark.url}
                      </a>
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-3">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Add Bookmark Modal */}
        <AddBookmarkModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onSubmit={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
          editingBookmark={editingBookmark}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false)
            setBookmarkToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Bookmark"
          message="Are you sure you want to delete this bookmark? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  )
}
