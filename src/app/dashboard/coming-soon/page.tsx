"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  Mail, 
  Bell, 
  ArrowLeft,
  Zap,
  Shield,
  Users,
  Search,
  Settings,
  FolderOpen,
  BarChart3,
  Bookmark
} from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"

interface FeatureInfo {
  title: string
  description: string
  icon: any
  estimatedRelease: string
  status: "development" | "planning" | "coming-soon"
  features: string[]
}

const featureMap: Record<string, FeatureInfo> = {
  bookmarks: {
    title: "Advanced Bookmarks",
    description: "Enhanced bookmark management with advanced features like bulk operations, imports, and exports.",
    icon: Bookmark,
    estimatedRelease: "Q2 2024",
    status: "development",
    features: ["Bulk import/export", "Advanced search filters", "Bookmark collections", "Tag management"]
  },
  search: {
    title: "Smart Search",
    description: "AI-powered search that understands your bookmarks and finds exactly what you're looking for.",
    icon: Search,
    estimatedRelease: "Q1 2024",
    status: "development",
    features: ["Full-text search", "AI-powered recommendations", "Search history", "Advanced filters"]
  },
  categories: {
    title: "Category Management",
    description: "Organize your bookmarks with custom categories, tags, and smart folders.",
    icon: FolderOpen,
    estimatedRelease: "Q1 2024",
    status: "planning",
    features: ["Custom categories", "Smart folders", "Bulk categorization", "Category analytics"]
  },
  team: {
    title: "Team Collaboration",
    description: "Share and collaborate on bookmarks with your team members.",
    icon: Users,
    estimatedRelease: "Q3 2024",
    status: "planning",
    features: ["Team workspaces", "Shared collections", "Permission management", "Activity feeds"]
  },
  settings: {
    title: "Settings & Preferences",
    description: "Customize your experience with personalized settings and preferences.",
    icon: Settings,
    estimatedRelease: "Q1 2024",
    status: "development",
    features: ["Profile settings", "Notification preferences", "Theme customization", "Data export"]
  }
}

export default function ComingSoon() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [featureName, setFeatureName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [isNotifying, setIsNotifying] = useState(false)
  const [notificationSent, setNotificationSent] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user?.email) {
        setEmail(user.email)
      }
    }

    getUser()

    // Get feature from URL parameter
    const feature = searchParams.get('feature') || 'settings'
    setFeatureName(feature)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user?.email) {
          setEmail(session.user.email)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [searchParams])

  const handleNotifyMe = async () => {
    if (!email) return
    
    setIsNotifying(true)
    
    try {
      // Simulate API call to save notification preference
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would actually save to your database
      // For example: await supabase.from('feature_notifications').insert({ email, feature: featureName })
      
      setNotificationSent(true)
    } catch (error) {
      console.error('Error saving notification:', error)
    } finally {
      setIsNotifying(false)
    }
  }

  const feature = featureMap[featureName] || {
    title: "New Feature",
    description: "We're working on something amazing for you!",
    icon: Zap,
    estimatedRelease: "Coming Soon",
    status: "planning" as const,
    features: ["Feature 1", "Feature 2", "Feature 3"]
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Smart Bookmark App</h1>
          <p className="text-gray-600 mb-8">
            This feature is coming soon! Check back later.
          </p>
          <div className="flex justify-center">
            <a 
              href="/dashboard"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </a>
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
                <h1 className="text-2xl font-semibold text-gray-900">{feature.title}</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6">
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                {feature.description}
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                  {getStatusText(feature.status)}
                </span>
                <span className="ml-3 text-gray-500">
                  Estimated: {feature.estimatedRelease}
                </span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">What's Coming</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feature.features.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mt-8 text-white text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-blue-100" />
                <h3 className="text-2xl font-bold mb-4">Get Notified</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Be the first to know when this feature launches. We'll send you an email as soon as it's ready.
                </p>
                
                {notificationSent ? (
                  <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-100 font-medium">You're on the list!</span>
                    </div>
                    <p className="text-green-200 text-sm mt-1">We'll notify you when {feature.title} is ready.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-2 rounded-lg text-gray-900 w-full sm:w-64"
                      required
                    />
                    <button 
                      onClick={handleNotifyMe}
                      disabled={!email || isNotifying}
                      className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                      {isNotifying ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Notify Me"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Alternative Actions */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  In the meantime, check out these available features:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/analytics')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
