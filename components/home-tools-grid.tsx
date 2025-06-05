import Link from "next/link"
import {
  FileText,
  QrCode,
  Sparkles,
  Star,
  Barcode,
} from "lucide-react"

const tools = [
  {
    name: "QR Code Generator",
    description: "Create custom QR codes for URLs, WiFi, contacts, and more. Download as PNG with advanced styling options.",
    icon: QrCode,
    color: "bg-purple-500",
    href: "/qr-code-and-barcode-generator",
  },
  {
    name: "Barcode Generator",
    description: "Generate various barcode formats including UPC, EAN, Code 128, and more for your products and inventory.",
    icon: Barcode,
    color: "bg-blue-500",
    href: "/qr-code-and-barcode-generator?tab=barcode",
  },
  {
    name: "PDF Tools",
    description: "Merge, split, compress, convert and edit PDF files with our comprehensive PDF toolkit.",
    icon: FileText,
    color: "bg-red-500",
    href: "/pdf-tools",
  },
]

export default function ToolsGrid() {
  return (
    <section className="py-16 bg-white">
      {/* SEO Metadata */}
      <head>
        <title>Free Online Tools - QR Code, Barcode & PDF Tools | ThynkLabs</title>
        <meta name="description" content="Free online tools for QR code generation, barcode creation, and PDF manipulation. No registration required, easy to use, and 100% free." />
        <meta name="keywords" content="free online tools, QR code generator, barcode generator, PDF tools, merge PDF, compress PDF, convert PDF" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Free Online Tools - QR Code, Barcode & PDF Tools" />
        <meta property="og:description" content="Free online tools for QR code generation, barcode creation, and PDF manipulation. No registration required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thynklabs.xyz/" />
      </head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">All the tools you'll need</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive online tools for QR codes, barcodes, PDFs, and more. 100% free. Easy to use. No registration required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-red-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`${tool.color} p-4 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                </div>
              </Link>
            )
          })}
          
          {/* Coming Soon Feature Cell */}
          <div className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-red-300 relative">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Coming Soon
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                More Tools Coming Soon
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We're working on exciting new tools for image editing, text manipulation, data conversion, and more!
              </p>
              <div className="mt-4 flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gray-300" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
