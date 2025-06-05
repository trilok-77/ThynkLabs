"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Upload, X, ArrowUp, ArrowDown, Merge, CheckCircle, AlertCircle } from "lucide-react"
import { PDFDocument } from "pdf-lib"

interface PDFFile {
  id: string
  name: string
  size: number
  file: File
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

export default function MergePDFPage() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after 4 seconds
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

  const addFiles = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
    const fileObjects: PDFFile[] = pdfFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file,
    }))
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

  const mergePDFs = async () => {
    setLoading(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedPdfFile = await mergedPdf.save()
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'merged.pdf'
      link.click()
      URL.revokeObjectURL(url)
      
      showToast('PDF files merged and downloaded successfully!', 'success')
    } catch (error) {
      console.error("Merge failed:", error)
      showToast('Failed to merge PDF files. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <head>
        <title>Free PDF Merger Online - Combine Multiple PDF Files into One</title>
        <meta name="description" content="Merge multiple PDF files into a single document online for free. Combine, rearrange, and organize PDF pages with our easy-to-use PDF merger tool." />
        <meta name="keywords" content="PDF merger, combine PDF, merge PDF files, join PDF, PDF combiner, free PDF merger, online PDF merger, merge multiple PDFs" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://thynklabs.xyz/merge-pdf" />
        <meta property="og:title" content="Free PDF Merger Online - Combine Multiple PDFs" />
        <meta property="og:description" content="Merge multiple PDF files into one document. Free online tool with drag-and-drop reordering." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thynklabs.xyz/merge-pdf" />
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
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Merge className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Merge PDF files</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Combine PDFs in the order you want with the easiest PDF merger available.
          </p>
        </div>

        {files.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-red-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select PDF files</h3>
            <p className="text-gray-600 mb-6">or drop PDFs here</p>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Select PDF files
            </Button>
            <input
              type="file"
              multiple
              accept=".pdf"
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF files to merge ({files.length})</h3>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded">
                        <Upload className="h-5 w-5 text-red-600" />
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
                    Add more files
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-8"
                    onClick={mergePDFs}
                    disabled={loading}
                  >
                    {loading ? "Merging..." : "Merge PDF"}
                  </Button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center text-red-600 text-sm">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    Merging PDFs...
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
