"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Upload, X, ArrowUp, ArrowDown, RotateCw, CheckCircle, AlertCircle } from "lucide-react"
import { PDFDocument, degrees } from "pdf-lib"

interface RotatePDFFile {
  id: string
  name: string
  size: number
  file: File
  rotation: number
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

export default function RotatePDFPage() {
  const [files, setFiles] = useState<RotatePDFFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

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

  const addFiles = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
    const fileObjects: RotatePDFFile[] = pdfFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file,
      rotation: 0,
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

  const updateFileRotation = (fileId: string, rotation: number) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, rotation } : file
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getRotationOptions = () => [
    { value: 0, label: "No rotation" },
    { value: 90, label: "90° clockwise" },
    { value: 180, label: "180°" },
    { value: 270, label: "270° clockwise" }
  ]

  // Preview component for rotation visualization
  const RotationPreview = ({ rotation }: { rotation: number }) => {
    const getTransform = (deg: number) => {
      switch(deg) {
        case 90: return 'rotate(90deg)'
        case 180: return 'rotate(180deg)'
        case 270: return 'rotate(270deg)'
        default: return 'rotate(0deg)'
      }
    }

    return (
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded border-2 border-gray-300">
        <div 
          className="w-8 h-10 bg-white border border-gray-400 rounded-sm flex items-center justify-center text-[8px] font-bold text-gray-600 transition-transform duration-300"
          style={{ transform: getTransform(rotation) }}
        >
          PDF
        </div>
      </div>
    )
  }

  // Grid preview component showing all 4 rotation states
  const RotationGrid = ({ currentRotation, onRotationSelect }: { 
    currentRotation: number, 
    onRotationSelect: (rotation: number) => void 
  }) => {
    const rotations = [0, 90, 180, 270]
    const labels = ['0°', '90°', '180°', '270°']

    return (
      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border">
        {rotations.map((rotation, index) => (
          <button
            key={rotation}
            onClick={() => onRotationSelect(rotation)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:bg-white ${
              currentRotation === rotation 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border-2 border-gray-300 mb-2">
              <div 
                className="w-10 h-12 bg-white border border-gray-400 rounded-sm flex items-center justify-center text-xs font-bold text-gray-600 transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                PDF
              </div>
            </div>
            <span className="text-xs font-medium text-gray-700">{labels[index]}</span>
          </button>
        ))}
      </div>
    )
  }

  const rotatePDFs = async () => {
    setLoading(true)
    try {
      const rotatedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await rotatedPdf.copyPages(pdf, pdf.getPageIndices())
        
        copiedPages.forEach((page) => {
          if (file.rotation !== 0) {
            page.setRotation(degrees(file.rotation))
          }
          rotatedPdf.addPage(page)
        })
      }

      const rotatedPdfFile = await rotatedPdf.save()
      const blob = new Blob([rotatedPdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'rotated.pdf'
      link.click()
      URL.revokeObjectURL(url)
      
      showToast('PDF files rotated and downloaded successfully!', 'success')
    } catch (error) {
      console.error("Rotation failed:", error)
      showToast('Failed to rotate PDF files. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <RotateCw className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Rotate PDF files</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rotate your PDF pages to the right direction. Rotate multiple PDFs at once.
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select PDF files</h3>
            <p className="text-gray-600 mb-6">or drop PDFs here</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF files to rotate ({files.length})</h3>

              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <Upload className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RotationPreview rotation={file.rotation} />
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

                  {/* Rotation Control Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Rotation Options:</h4>
                      <select
                        value={file.rotation}
                        onChange={(e) => updateFileRotation(file.id, Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
                      >
                        {getRotationOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visual Grid Preview */}
                    <RotationGrid 
                      currentRotation={file.rotation}
                      onRotationSelect={(rotation) => updateFileRotation(file.id, rotation)}
                    />
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    onClick={rotatePDFs}
                    disabled={loading}
                  >
                    {loading ? "Rotating..." : "Rotate PDF"}
                  </Button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center text-blue-600 text-sm">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Rotating PDFs...
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