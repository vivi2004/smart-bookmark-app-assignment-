"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Bookmark as BookmarkIcon, TrendingUp, Clock, Tag } from "lucide-react"
import BookmarkList from "@/components/BookmarkList"
import AuthButton from "@/components/AuthButton"
import Sidebar from "@/components/Sidebar"
import AddBookmarkModal from "@/components/AddBookmarkModal"
import { useAuth } from "@/hooks/useAuth"
import { useBookmarks } from "@/hooks/useBookmarks"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { bookmarks, loading: bookmarksLoading } = useBookmarks(user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>()

  const loading = authLoading || bookmarksLoading
            })
          }

          if (payload.eventType === "UPDATE") {
            setBookmarks(prev =>
              prev.map(b => (b.id === payload.new.id ? payload.new : b))
            )
          }

          if (payload.eventType === "DELETE") {
            setBookmarks(prev => prev.filter(b => b.id !== payload.old.id))
          }
        }
      )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBookmark = async (bookmark: Omit<Bookmark, "id" | "created_at">) => {
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

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setIsAddModalOpen(true)
  }

  const handleUpdateBookmark = async (bookmark: Omit<Bookmark, "id" | "created_at">) => {
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

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingBookmark(undefined)
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

  const stats = {
    total: bookmarks.length,
    recent: bookmarks.filter(b => {
      const createdAt = new Date(b.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdAt > weekAgo
    }).length,
    categories: [...new Set(bookmarks.map(b => b.category).filter(Boolean))].length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookmarks...</p>
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
            Sign in to access your personal bookmark collection
          </p>
          <div className="flex justify-center">
            <AuthButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
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
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              <AuthButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {/* Stats Cards */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookmarkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookmarks</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.recent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.categories}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 mb-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user.email?.split("@")[0]}!</h2>
              <p className="text-blue-100 mb-4">
                Here's what's happening with your bookmarks today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Add New Bookmark
                </button>
                <button 
                  onClick={() => router.push('/dashboard/analytics')}
                  className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                >
                  View Analytics
                </button>
              </div>
            </div>

            {/* Bookmarks List */}
            <BookmarkList
              bookmarks={bookmarks}
              onAddBookmark={handleAddBookmark}
              onUpdateBookmark={handleUpdateBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onEditBookmark={handleEditBookmark}
            />

            {/* Add Bookmark Modal */}
            <AddBookmarkModal
              isOpen={isAddModalOpen}
              onClose={handleCloseModal}
              onSubmit={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
              editingBookmark={editingBookmark}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
