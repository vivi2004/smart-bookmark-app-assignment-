import { Bookmark, Search, Shield, Zap, Globe, BarChart, Users, Clock } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Bookmark,
      title: "Smart Organization",
      description: "Automatically categorize your bookmarks with intelligent tagging and folder management.",
      color: "blue"
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Find any bookmark instantly with full-text search, filters, and advanced queries.",
      color: "green"
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description: "Your bookmarks are encrypted and stored securely with enterprise-grade protection.",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Access your bookmarks instantly with our optimized infrastructure and caching.",
      color: "yellow"
    },
    {
      icon: Globe,
      title: "Cross-Platform",
      description: "Access your bookmarks from any device, anywhere in the world with cloud sync.",
      color: "indigo"
    },
    {
      icon: BarChart,
      title: "Analytics",
      description: "Track your bookmark usage patterns and discover insights about your browsing habits.",
      color: "red"
    },
  ]

  const secondaryFeatures = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share bookmark collections with your team and collaborate in real-time."
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Never lose a bookmark with automatic version control and backup."
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      indigo: "bg-indigo-100 text-indigo-600",
      red: "bg-red-100 text-red-600",
    }
    return colors[color as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Bookmarks
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to make bookmark management effortless and enjoyable.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${getColorClasses(feature.color)}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Features */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {secondaryFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
