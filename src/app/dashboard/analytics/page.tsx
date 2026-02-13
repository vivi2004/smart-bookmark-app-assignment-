"use client"

import { useState, useMemo } from "react"
import { BarChart3, TrendingUp, Clock, Tag, Bookmark, ExternalLink, Calendar } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import AuthButton from "@/components/AuthButton"
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

interface CategoryStats {
  name: string
  count: number
  percentage: number
  color: string
}

interface DailyStats {
  date: string
  count: number
}

export default function Analytics() {
  const { user, loading: authLoading } = useAuth()
  const { bookmarks, loading: bookmarksLoading } = useBookmarks(user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loading = authLoading || bookmarksLoading

  // Memoized calculations for better performance
  const analyticsData = useMemo(() => {
    const totalBookmarks = bookmarks.length
    
    const recentBookmarks = bookmarks.filter(b => {
      const createdAt = new Date(b.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdAt > weekAgo
    }).length

    // Calculate categories
    const categories = bookmarks.reduce((acc: CategoryStats[], bookmark) => {
      if (bookmark.category) {
        const existing = acc.find(c => c.name === bookmark.category)
        if (existing) {
          existing.count++
        } else {
          const colors = ['blue', 'green', 'purple', 'yellow', 'red', 'indigo']
          acc.push({
            name: bookmark.category,
            count: 1,
            percentage: 0,
            color: colors[acc.length % colors.length]
          })
        }
      }
      return acc
    }, [])

    // Calculate percentages
    categories.forEach(cat => {
      cat.percentage = totalBookmarks > 0 ? (cat.count / totalBookmarks) * 100 : 0
    })

    // Get most recent bookmarks
    const recentBookmarksList = bookmarks.slice(0, 5)

    // Get daily stats for the last 7 days
    const dailyStats: DailyStats[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = bookmarks.filter(b => 
        b.created_at.startsWith(dateStr)
      ).length
      dailyStats.push({ date: dateStr, count })
    }

    return {
      totalBookmarks,
      recentBookmarks,
      categories,
      recentBookmarksList,
      dailyStats
    }
  }, [bookmarks])

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
      gray: "bg-gray-100 text-gray-600"
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "development":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "coming-soon":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "development":
        return "In Development"
      case "planning":
        return "Planning Phase"
      case "coming-soon":
        return "Coming Soon"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
            Sign in to view your analytics
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
                <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">Analytics</h1>
              </div>
              <AuthButton user={user} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Bookmark Analytics</h2>
              <p className="text-gray-600">Track your bookmark usage patterns and insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Bookmark className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookmarks</p>
                    <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalBookmarks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-semibold text-gray-900">{analyticsData.recentBookmarks}</p>
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
                    <p className="text-2xl font-semibold text-gray-900">{analyticsData.categories.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg/Day</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analyticsData.dailyStats.length > 0 ? Math.round(analyticsData.totalBookmarks / analyticsData.dailyStats.length) : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Categories Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Breakdown</h3>
                <div className="space-y-3">
                  {analyticsData.categories.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No categories yet</p>
                  ) : (
                    analyticsData.categories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getColorClasses(category.color)}`}></div>
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{category.count}</span>
                          <span className="text-xs text-gray-400">({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {analyticsData.recentBookmarksList.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No bookmarks yet</p>
                  ) : (
                    analyticsData.recentBookmarksList.map((bookmark) => (
                      <div key={bookmark.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Bookmark className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{bookmark.title}</p>
                          <p className="text-sm text-gray-600 truncate">{bookmark.url}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(bookmark.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
              <div className="flex items-end space-x-2 h-32">
                {analyticsData.dailyStats.map((stat, index) => (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ 
                        height: `${Math.max((stat.count / Math.max(...analyticsData.dailyStats.map(s => s.count), 1)) * 100, 5)}%` 
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {new Date(stat.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {stat.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
