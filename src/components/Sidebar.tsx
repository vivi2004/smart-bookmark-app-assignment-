"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Bookmark, 
  Home, 
  Search, 
  Tag, 
  Settings, 
  BarChart3, 
  Users, 
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  bookmarks?: any[]
}

export default function Sidebar({ isOpen, onClose, bookmarks = [] }: SidebarProps) {
  const pathname = usePathname()
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

  // Calculate real category counts from bookmarks - optimized with Map for O(1) lookups
  const realCategories = useMemo(() => {
    if (!bookmarks.length) return []
    
    const categoryMap = new Map<string, { name: string; count: number; color: string }>()
    const colors = ["blue", "green", "purple", "yellow", "red", "indigo"]
    
    // Single pass through bookmarks
    for (const bookmark of bookmarks) {
      if (bookmark.category) {
        const existing = categoryMap.get(bookmark.category)
        if (existing) {
          existing.count++
        } else {
          categoryMap.set(bookmark.category, {
            name: bookmark.category,
            count: 1,
            color: colors[categoryMap.size % colors.length]
          })
        }
      }
    }
    
    return Array.from(categoryMap.values())
  }, [bookmarks])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "All Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
    { name: "Search", href: "/dashboard/search", icon: Search },
    { name: "Categories", href: "/dashboard/categories", icon: Tag },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  // Memoize color classes to avoid recreating on every render
  const getColorClasses = useMemo(() => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
      gray: "bg-gray-100 text-gray-600"
    }
    return (color: string) => colors[color as keyof typeof colors] || colors.gray
  }, [])

  // Memoize categories list to avoid unnecessary re-renders
  const categoriesList = useMemo(() => {
    if (realCategories.length === 0) {
      return (
        <div className="px-3 py-2 text-sm text-gray-400">
          No categories yet
        </div>
      )
    }

    return realCategories.map((category) => (
      <Link
        key={category.name}
        href={`/dashboard/category/${category.name.toLowerCase()}`}
        className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        onClick={() => onClose()}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getColorClasses(category.color)}`}></div>
          <span>{category.name}</span>
        </div>
        <span className="text-xs text-gray-400">{category.count}</span>
      </Link>
    ))
  }, [realCategories, getColorClasses, onClose])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SmartMarks</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>

          {/* Quick Add */}
          <div className="p-4 border-b border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Bookmark</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => onClose()}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Categories */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5" />
                  <span>Categories</span>
                </div>
                {categoriesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {categoriesExpanded && (
                <div className="mt-2 space-y-1">
                  {categoriesList}
                </div>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2024 SmartMarks
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
