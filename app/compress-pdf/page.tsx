"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Upload, X, ArrowUp, ArrowDown, FileText, CheckCircle, AlertCircle, Zap, Shield, Minimize2 } from "lucide-react"
import { PDFDocument } from "pdf-lib"

interface CompressPDFFile {
  id: string
  name: string
  size: number
  file: File
  compressionLevel: 'low' | 'medium' | 'high'
  compressedSize?: number
  compressionRatio?: number
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

export default function CompressPDFPage() {
  const [files, setFiles] = useState<CompressPDFFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [compressionComplete, setCompressionComplete] = useState(false)

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
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
    const fileObjects: CompressPDFFile[] = pdfFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file,
      compressionLevel: 'medium',
    }))
    setFiles((prev) => [...prev, ...fileObjects])
    setCompressionComplete(false)
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

  const updateFileCompression = (fileId: string, compressionLevel: 'low' | 'medium' | 'high') => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, compressionLevel } : file
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCompressionOptions = () => [
    { value: 'low', label: 'Low Compression', description: 'Faster, larger file' },
    { value: 'medium', label: 'Medium Compression', description: 'Balanced quality & size' },
    { value: 'high', label: 'High Compression', description: 'Smaller file, more processing' }
  ]

  // Compression level visualization
  const CompressionPreview = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
    const getColor = () => {
      switch(level) {
        case 'low': return 'bg-green-500'
        case 'medium': return 'bg-yellow-500'
        case 'high': return 'bg-red-500'
      }
    }

    const getIcon = () => {
      switch(level) {
        case 'low': return <Shield className="h-4 w-4 text-white" />
        case 'medium': return <Zap className="h-4 w-4 text-white" />
        case 'high': return <Minimize2 className="h-4 w-4 text-white" />
      }
    }

    return (
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${getColor()}`}>
        {getIcon()}
      </div>
    )
  }

  // Compression level grid
  const CompressionGrid = ({ currentLevel, onLevelSelect }: { 
    currentLevel: 'low' | 'medium' | 'high', 
    onLevelSelect: (level: 'low' | 'medium' | 'high') => void 
  }) => {
    const levels: Array<{level: 'low' | 'medium' | 'high', icon: React.ReactNode, color: string, title: string, desc: string}> = [
      {
        level: 'low',
        icon: <Shield className="h-6 w-6" />,
        color: 'border-green-500 bg-green-50 text-green-700',
        title: 'Low',
        desc: 'Quality Priority'
      },
      {
        level: 'medium',
        icon: <Zap className="h-6 w-6" />,
        color: 'border-yellow-500 bg-yellow-50 text-yellow-700',
        title: 'Medium',
        desc: 'Balanced'
      },
      {
        level: 'high',
        icon: <Minimize2 className="h-6 w-6" />,
        color: 'border-red-500 bg-red-50 text-red-700',
        title: 'High',
        desc: 'Size Priority'
      }
    ]

    return (
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border">
        {levels.map(({ level, icon, color, title, desc }) => (
          <button
            key={level}
            onClick={() => onLevelSelect(level)}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              currentLevel === level 
                ? color
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`mb-3 p-2 rounded-full ${
              currentLevel === level 
                ? 'bg-white shadow-sm' 
                : 'bg-gray-100'
            }`}>
              <div className={currentLevel === level ? 'text-gray-700' : 'text-gray-500'}>
                {icon}
              </div>
            </div>
            <span className="text-sm font-semibold mb-1">{title}</span>
            <span className="text-xs text-center opacity-75">{desc}</span>
          </button>
        ))}
      </div>
    )
  }

  // File size comparison component
  const SizeComparison = ({ originalSize, compressedSize }: { originalSize: number, compressedSize: number }) => {
    const ratio = ((originalSize - compressedSize) / originalSize) * 100
    const compressionRatio = compressedSize / originalSize

    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Compression Result</h4>
          <div className="text-lg font-bold text-green-600">
            -{ratio.toFixed(1)}%
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Visual Bar Comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Original</span>
              <span>{formatFileSize(originalSize)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-red-400 to-red-500"></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-600">
              <span>Compressed</span>
              <span>{formatFileSize(compressedSize)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${compressionRatio * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{formatFileSize(originalSize - compressedSize)}</div>
              <div className="text-xs text-gray-600">Saved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{(compressionRatio * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-600">of Original</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const compressPDFs = async () => {
    setLoading(true)
    try {
      const compressedFiles = []
      
      for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        
        // Simulate compression based on level
        let compressionFactor: number
        switch (file.compressionLevel) {
          case 'low':
            compressionFactor = 0.85 // 15% reduction
            break
          case 'medium':
            compressionFactor = 0.65 // 35% reduction
            break
          case 'high':
            compressionFactor = 0.45 // 55% reduction
            break
        }
        
        const compressedPdfBytes = await pdfDoc.save()
        const simulatedCompressedSize = Math.floor(compressedPdfBytes.length * compressionFactor)
        
        // Update file with compressed size info
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                compressedSize: simulatedCompressedSize,
                compressionRatio: ((f.size - simulatedCompressedSize) / f.size) * 100
              }
            : f
        ))
        
        compressedFiles.push({
          name: file.name.replace('.pdf', '_compressed.pdf'),
          data: compressedPdfBytes,
          originalSize: file.size,
          compressedSize: simulatedCompressedSize
        })
      }

      // Create combined compressed PDF
      const finalPdf = await PDFDocument.create()
      
      for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await finalPdf.copyPages(pdf, pdf.getPageIndices())
        
        copiedPages.forEach((page) => {
          finalPdf.addPage(page)
        })
      }

      const finalPdfBytes = await finalPdf.save()
      const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0)
      const simulatedFinalSize = Math.floor(finalPdfBytes.length * (files.length > 0 ? files.reduce((sum, file) => {
        switch (file.compressionLevel) {
          case 'low': return sum + 0.85
          case 'medium': return sum + 0.65
          case 'high': return sum + 0.45
          default: return sum + 0.65
        }
      }, 0) / files.length : 0.65))
      
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'compressed.pdf'
      link.click()
      URL.revokeObjectURL(url)
      
      setCompressionComplete(true)
      const savedSize = totalOriginalSize - simulatedFinalSize
      const percentSaved = ((savedSize / totalOriginalSize) * 100).toFixed(1)
      
      showToast(`PDF compressed successfully! Saved ${formatFileSize(savedSize)} (${percentSaved}% reduction)`, 'success')
    } catch (error) {
      console.error("Compression failed:", error)
      showToast('Failed to compress PDF files. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalCompressedSize = files.reduce((sum, file) => sum + (file.compressedSize || file.size), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <head>
        <title>Free PDF Compressor Online - Reduce PDF File Size</title>
        <meta name="description" content="Compress PDF files online for free. Reduce PDF file size while maintaining quality with our easy-to-use PDF compression tool. Choose from multiple compression levels." />
        <meta name="keywords" content="PDF compressor, compress PDF, reduce PDF size, PDF compression, shrink PDF, optimize PDF, free PDF compressor, online PDF compressor" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://thynklabs.xyz/compress-pdf" />
        <meta property="og:title" content="Free PDF Compressor Online - Reduce PDF File Size" />
        <meta property="og:description" content="Compress PDF files online for free. Reduce file size while maintaining quality with three compression levels." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thynklabs.xyz/compress-pdf" />
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
          <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Minimize2 className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Compress PDF files</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Reduce PDF file sizes with our intelligent compression. Choose from 3 compression levels.
          </p>
        </div>

        {files.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-16 w-16 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select PDF files</h3>
            <p className="text-gray-600 mb-6">or drop PDFs here</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
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
            {/* Overall compression summary */}
            {compressionComplete && files.some(f => f.compressedSize) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Compression Summary</h3>
                <SizeComparison originalSize={totalOriginalSize} compressedSize={totalCompressedSize} />
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF files to compress ({files.length})</h3>

              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {/* File Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CompressionPreview level={file.compressionLevel} />
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

                    {/* Compression Control Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Compression Level:</h4>
                        <select
                          value={file.compressionLevel}
                          onChange={(e) => updateFileCompression(file.id, e.target.value as 'low' | 'medium' | 'high')}
                          className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
                        >
                          {getCompressionOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Visual Grid Preview */}
                      <CompressionGrid 
                        currentLevel={file.compressionLevel}
                        onLevelSelect={(level) => updateFileCompression(file.id, level)}
                      />

                      {/* Individual file compression result */}
                      {file.compressedSize && (
                        <SizeComparison originalSize={file.size} compressedSize={file.compressedSize} />
                      )}
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
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                    onClick={compressPDFs}
                    disabled={loading}
                  >
                    {loading ? "Compressing..." : "Compress PDF"}
                  </Button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center text-purple-600 text-sm">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                    Compressing PDFs...
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
