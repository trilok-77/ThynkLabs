"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Upload, X, ArrowUp, ArrowDown, FileImage, CheckCircle, AlertCircle, Download } from "lucide-react"
import { PDFDocument, rgb } from "pdf-lib"

interface ImageFile {
  id: string
  name: string
  size: number
  file: File
  preview: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ConversionOptions {
  addMargin: boolean
}

export default function JPGToPDFPage() {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [options, setOptions] = useState<ConversionOptions>({
    addMargin: false
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after 7 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 7000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  const addFiles = async (newFiles: File[]) => {
    const imageFiles = newFiles.filter((file) => 
      file.type === "image/jpeg" || 
      file.type === "image/jpg" || 
      file.type === "image/png" ||
      file.type === "image/webp"
    )
    
    if (imageFiles.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP)', 'error')
      return
    }

    const fileObjects: ImageFile[] = await Promise.all(
      imageFiles.map(async (file) => {
        const preview = await createPreview(file)
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          file,
          preview,
        }
      })
    )
    
    setFiles((prev) => [...prev, ...fileObjects])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const moveFile = (id: string, direction: "up" | "down") => {
    setFiles((prev) => {
      const index = prev.findIndex((file) => file.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev

      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(index, 1)
      newFiles.splice(newIndex, 0, movedFile)
      return newFiles
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const convertToPDF = async () => {
    setLoading(true)
    try {
      const pdfDoc = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer()
        let image

        // Embed image based on type
        if (file.file.type === "image/jpeg" || file.file.type === "image/jpg") {
          image = await pdfDoc.embedJpg(arrayBuffer)
        } else if (file.file.type === "image/png") {
          image = await pdfDoc.embedPng(arrayBuffer)
        } else {
          // For WebP and other formats, we'll need to convert to canvas first
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = file.preview
          })

          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(',')[1]), c => c.charCodeAt(0))
          image = await pdfDoc.embedJpg(jpegBytes)
        }

        // Calculate dimensions based on options
        const { width: imgWidth, height: imgHeight } = image.scale(1)
        const margin = options.addMargin ? 40 : 0
        
        // Page size includes margin
        const pageWidth = imgWidth + (margin * 2)
        const pageHeight = imgHeight + (margin * 2)
        
        const page = pdfDoc.addPage([pageWidth, pageHeight])

        // Draw the image with margin offset
        page.drawImage(image, {
          x: margin,
          y: margin,
          width: imgWidth,
          height: imgHeight,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'converted-images.pdf'
      link.click()
      URL.revokeObjectURL(url)
      
      showToast('Images converted to PDF and downloaded successfully!', 'success')
    } catch (error) {
      console.error("Conversion failed:", error)
      showToast('Failed to convert images to PDF. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <head>
        <title>Free JPG to PDF Converter Online - Convert Images to PDF</title>
        <meta name="description" content="Convert JPG, PNG, and WebP images to PDF online for free. Combine multiple images into a single PDF document with customizable options." />
        <meta name="keywords" content="JPG to PDF, PNG to PDF, image to PDF, convert images to PDF, combine images, free PDF converter, online image converter" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://thynklabs.xyz/image-to-pdf" />
        <meta property="og:title" content="Free JPG to PDF Converter Online" />
        <meta property="og:description" content="Convert and combine multiple images into a single PDF document. Free online tool with customization options." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thynklabs.xyz/image-to-pdf" />
      </head>
      
      <Header />

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 min-w-80 transform transition-all duration-300 ease-in-out ${
              toast.type === 'success'
                ? 'bg-white border-l-green-500 text-green-800'
                : 'bg-white border-l-red-500 text-red-800'
            }`}
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div className="flex-shrink-0 mr-3">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FileImage className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">JPG to PDF Converter</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert your JPG, PNG, and other image files to PDF in the order you prefer.
          </p>
        </div>

        {files.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select image files</h3>
            <p className="text-gray-600 mb-6">or drop JPG, PNG, WebP images here</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Select image files
            </Button>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                if (e.target.files) {
                  addFiles(Array.from(e.target.files))
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conversion Options Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Options</h3>
              
              <div className="space-y-4">
                {/* Margin Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 block mb-1">
                      Add White Margin
                    </label>
                    <p className="text-xs text-gray-600">
                      Add white space around images for a cleaner look
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setOptions(prev => ({ ...prev, addMargin: !prev.addMargin }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        options.addMargin ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          options.addMargin ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`ml-3 text-sm font-medium ${
                      options.addMargin ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {options.addMargin ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* Preview of margin effect */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">Preview:</span>
                    <span className="text-xs text-gray-600">
                      {options.addMargin ? 'With margin' : 'No margin (default)'}
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    {/* Without margin preview */}
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-2 text-center">Without Margin</div>
                      <div className="bg-white rounded border-2 border-dashed border-gray-300 h-16 flex items-center justify-center">
                        <div className="bg-blue-200 w-full h-full rounded flex items-center justify-center">
                          <span className="text-xs text-blue-800">Image</span>
                        </div>
                      </div>
                    </div>
                    {/* With margin preview */}
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-2 text-center">With Margin</div>
                      <div className="bg-white rounded border-2 border-dashed border-gray-300 h-16 p-2 flex items-center justify-center">
                        <div className="bg-blue-200 w-3/4 h-3/4 rounded flex items-center justify-center">
                          <span className="text-xs text-blue-800">Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Images to convert ({files.length})</h3>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded border overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => moveFile(file.id, "up")} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(file.id, "down")}
                        disabled={index === files.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center mt-6 space-y-4">
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                    Add more images
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex items-center space-x-2"
                    onClick={convertToPDF}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Convert to PDF</span>
                      </>
                    )}
                  </Button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center text-blue-600 text-sm">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Converting images to PDF...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
