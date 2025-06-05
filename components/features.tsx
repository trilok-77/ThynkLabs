import { Shield, Zap, BanknoteX, Smartphone } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "100% Secure",
    description: "All files are processed securely in the browser. No file leaves your system.",
  },
  {
    icon: Zap,
    title: "Fast & Easy",
    description: "Process files in just a few clicks. Most tools process files in under 30 seconds.",
  },
  {
    icon: BanknoteX,
    title: "Forever Free",
    description: "No subscriptions. No hidden fees. All tools are free to use.",
  },
  {
    icon: Smartphone,
    title: "All Platforms",
    description: "Works on Windows, Mac, Linux, iOS, Android and any device with a web browser.",
  },
]

export default function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why choose Thynk Labs?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">We make tools easy. And it's completely free.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div key={feature.title} className="text-center">
                <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
