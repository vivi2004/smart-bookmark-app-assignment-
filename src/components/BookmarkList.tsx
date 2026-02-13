"use client"

import { useState } from "react"
import { Search, Plus, Filter } from "lucide-react"
import BookmarkCard from "./BookmarkCard"
import AddBookmarkModal from "./AddBookmarkModal"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  created_at: string
}

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onAddBookmark: (bookmark: Omit<Bookmark, "id" | "created_at">) => void
  onUpdateBookmark: (bookmark: Omit<Bookmark, "id" | "created_at">) => void
  onDeleteBookmark: (id: string) => void
  onEditBookmark: (bookmark: Bookmark) => void
}

export default function BookmarkList({ 
  bookmarks, 
  onAddBookmark, 
  onUpdateBookmark, 
  onDeleteBookmark,
  onEditBookmark
}: BookmarkListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>()

  const categories = ["all", ...Array.from(new Set(bookmarks.map(b => b.category).filter(Boolean)))]

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || bookmark.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleAddBookmark = async (bookmark: Omit<Bookmark, "id" | "created_at">) => {
    await onAddBookmark(bookmark)
  }

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setIsAddModalOpen(true)
  }

  const handleUpdateBookmark = async (bookmark: Omit<Bookmark, "id" | "created_at">) => {
    if (editingBookmark?.id) {
      await onUpdateBookmark(bookmark)
      setEditingBookmark(undefined)
    }
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingBookmark(undefined)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookmarks</h1>
        <p className="text-gray-600">Organize and manage your favorite links</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Bookmark</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks found"}
          </div>
          {bookmarks.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add your first bookmark
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map(bookmark => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={onDeleteBookmark}
              onEdit={handleEditBookmark}
            />
          ))}
        </div>
      )}

      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
        editingBookmark={editingBookmark}
      />
    </div>
  )
}
