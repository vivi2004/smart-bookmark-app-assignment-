"use client"

import { useState } from "react"
import { Trash2, Edit2, ExternalLink, Tag } from "lucide-react"
import ConfirmDialog from "./ConfirmDialog"

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  created_at: string
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
  onEdit: (bookmark: Bookmark) => void
}

export default function BookmarkCard({ bookmark, onDelete, onEdit }: BookmarkCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      onDelete(bookmark.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleVisit = () => {
    window.open(bookmark.url, "_blank")
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 truncate flex-1 pr-2">{bookmark.title}</h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleVisit}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
            title="Visit link"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
            title="Edit bookmark"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete bookmark"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {bookmark.description && (
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{bookmark.description}</p>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
        <a 
          href={bookmark.url} 
          className="text-blue-600 text-sm hover:underline truncate flex-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          {bookmark.url}
        </a>
        {bookmark.category && (
          <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex-shrink-0">
            <Tag size={12} className="text-blue-500" />
            <span className="font-medium">{bookmark.category}</span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        {new Date(bookmark.created_at).toLocaleDateString()}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${bookmark.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
