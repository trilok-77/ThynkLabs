  import Link from "next/link"
  import {
    // FileText,
    // Scissors,
    Merge,
    FileArchiveIcon as Compress,
    RotateCw,
    // Lock,
    // Unlock,
    ImageIcon,
    FileImage,
    // FileSpreadsheet,
    // Presentation,
    // Edit,
    // FilePenLineIcon as Signature,
    // FingerprintIcon as Watermark,
    // ScanLine,
    // ArrowUpDown,
    Sparkles,
    Star,
    Clock,
  } from "lucide-react"

  const tools = [
    {
      name: "Merge PDF",
      description: "Combine PDFs in the order you want with the easiest PDF merger available.",
      icon: Merge,
      color: "bg-red-500",
      href: "/merge-pdf",
    },
    // {
    //   name: "Split PDF",
    //   description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    //   icon: Scissors,
    //   color: "bg-blue-500",
    //   href: "/split-pdf",
    // },
    {
      name: "Compress PDF",
      description: "Reduce file size while optimizing for maximal PDF quality.",
      icon: Compress,
      color: "bg-green-500",
      href: "/compress-pdf",
    },
    // {
    //   name: "PDF to Word",
    //   description: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    //   icon: FileText,
    //   color: "bg-blue-600",
    //   href: "/pdf-to-word",
    // },
    // {
    //   name: "PDF to Excel",
    //   description: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    //   icon: FileSpreadsheet,
    //   color: "bg-green-600",
    //   href: "/pdf-to-excel",
    // },
    // {
    //   name: "PDF to PowerPoint",
    //   description: "Turn your PDF files into editable PowerPoint PPT and PPTX slideshows.",
    //   icon: Presentation,
    //   color: "bg-orange-500",
    //   href: "/pdf-to-powerpoint",
    // },
    {
      name: "PDF to JPG",
      description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
      icon: FileImage,
      color: "bg-purple-500",
      href: "/pdf-to-jpg",
    },
    // {
    //   name: "Word to PDF",
    //   description: "Make DOC and DOCX files easy to read by converting them to PDF.",
    //   icon: FileText,
    //   color: "bg-blue-700",
    //   href: "/word-to-pdf",
    // },
    // {
    //   name: "Excel to PDF",
    //   description: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    //   icon: FileSpreadsheet,
    //   color: "bg-green-700",
    //   href: "/excel-to-pdf",
    // },
    {
      name: "JPG to PDF",
      description: "Convert JPG, PNG, BMP, GIF and TIFF images to PDF in seconds.",
      icon: ImageIcon,
      color: "bg-purple-600",
      href: "/image-to-pdf",
    },
    // {
    //   name: "Sign PDF",
    //   description: "Sign yourself or request others to electronically sign PDF documents.",
    //   icon: Signature,
    //   color: "bg-indigo-500",
    //   href: "/sign-pdf",
    // },
    // {
    //   name: "Watermark PDF",
    //   description: "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    //   icon: Watermark,
    //   color: "bg-cyan-500",
    //   href: "/watermark-pdf",
    // },
    {
      name: "Rotate PDF",
      description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
      icon: RotateCw,
      color: "bg-yellow-500",
      href: "/rotate-pdf",
    },
    // {
    //   name: "Unlock PDF",
    //   description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    //   icon: Unlock,
    //   color: "bg-red-400",
    //   href: "/unlock-pdf",
    // },
    // {
    //   name: "Protect PDF",
    //   description: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    //   icon: Lock,
    //   color: "bg-gray-600",
    //   href: "/protect-pdf",
    // },
    // {
    //   name: "Organize PDF",
    //   description: "Sort pages of your PDF file however you like. Delete and rotate pages or add new ones.",
    //   icon: ArrowUpDown,
    //   color: "bg-pink-500",
    //   href: "/organize-pdf",
    // },
    // {
    //   name: "PDF Scanner",
    //   description: "Turn your mobile device into a powerful PDF Scanner with advanced OCR.",
    //   icon: ScanLine,
    //   color: "bg-teal-500",
    //   href: "/pdf-scanner",
    // },
    // {
    //   name: "Edit PDF",
    //   description: "Add text, images, shapes or freehand annotations to a PDF document.",
    //   icon: Edit,
    //   color: "bg-orange-600",
    //   href: "/edit-pdf",
    // },
    
  ]

  export default function ToolsGrid() {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">All the tools you'll need</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Work with PDF files online. 100% free. Easy to use. No registration required.
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
            
            {/* Coming Soon Feature Cell - More Subtle Version */}
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
                  More Features
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We're working on exciting new PDF tools including Split PDF, PDF to Word, Excel, PowerPoint, and more!
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
