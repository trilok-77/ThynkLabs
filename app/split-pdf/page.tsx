"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Upload, X, CheckCircle, AlertCircle, Scissors, Plus, FileText } from "lucide-react"
import { PDFDocument } from "pdf-lib"

interface SplitPDFFile {
  id: string
  name: string
  size: number
  file: File
  pages: PDFPagePreview[]
}

interface PDFPagePreview {
  pageNumber: number
  thumbnail?: string
  selected: boolean
}

interface Range {
  id: string
  fromPage: number
  toPage: number
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

type SplitMode = 'range' | 'pages' | 'size'
type RangeMode = 'custom' | 'fixed'
type ExtractMode = 'all' | 'select'

export default function SplitPDFPage() {
  const [files, setFiles] = useState<SplitPDFFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  
  // Split configuration state
  const [splitMode, setSplitMode] = useState<SplitMode>('range')
  const [rangeMode, setRangeMode] = useState<RangeMode>('custom')
  const [extractMode, setExtractMode] = useState<ExtractMode>('all')
  const [ranges, setRanges] = useState<Range[]>([{ id: '1', fromPage: 1, toPage: 1 }])
  const [mergeRanges, setMergeRanges] = useState(false)
  const [selectedPages, setSelectedPages] = useState('')
  const [mergeExtracted, setMergeExtracted] = useState(false)

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

  const addFiles = async (newFiles: File[]) => {
    const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
    
    for (const file of pdfFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pageCount = pdfDoc.getPageCount()
        
        // Generate thumbnails for each page
        const pages: PDFPagePreview[] = await Promise.all(
          Array.from({ length: pageCount }, async (_, i) => {
            // Create a thumbnail for the page
            const thumbnail = await generateThumbnail(pdfDoc, i)
            return {
              pageNumber: i + 1,
              thumbnail,
              selected: false
            }
          })
        )

        const fileObject: SplitPDFFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          file,
          pages
        }
        
        setFiles(prev => [...prev, fileObject])
        
        // Update range to match PDF page count
        if (ranges.length === 1 && ranges[0].toPage === 1) {
          setRanges([{ id: '1', fromPage: 1, toPage: pageCount }])
        }
      } catch (error) {
        console.error("Error loading PDF:", error)
        showToast(`Failed to load PDF: ${file.name}`, 'error')
      }
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const addRange = () => {
    const newRange: Range = {
      id: Math.random().toString(36).substr(2, 9),
      fromPage: 1,
      toPage: files[0]?.pages.length || 1
    }
    setRanges(prev => [...prev, newRange])
  }

  const updateRange = (id: string, field: 'fromPage' | 'toPage', value: number) => {
    setRanges(prev => prev.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ))
  }

  const removeRange = (id: string) => {
    if (ranges.length > 1) {
      setRanges(prev => prev.filter(range => range.id !== id))
    }
  }

  const togglePageSelection = (fileId: string, pageNumber: number) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? {
            ...file,
            pages: file.pages.map(page => 
              page.pageNumber === pageNumber 
                ? { ...page, selected: !page.selected }
                : page
            )
          }
        : file
    ))
  }

  const getSelectedPagesCount = () => {
    if (splitMode === 'pages' && extractMode === 'select') {
      return selectedPages.split(',').filter(p => p.trim()).length
    }
    return files.reduce((total, file) => 
      total + file.pages.filter(page => page.selected).length, 0
    )
  }

  const calculateExpectedFiles = () => {
    if (splitMode === 'range') {
      return mergeRanges ? 1 : ranges.length
    } else if (splitMode === 'pages') {
      if (extractMode === 'all') {
        return files.reduce((total, file) => total + file.pages.length, 0)
      } else {
        const selectedCount = getSelectedPagesCount()
        return mergeExtracted ? 1 : selectedCount
      }
    }
    return 0
  }

  const splitPDFs = async () => {
    if (files.length === 0) {
      showToast('Please upload a PDF file first.', 'error')
      return
    }

    setLoading(true)
    try {
      const file = files[0] // For simplicity, working with first file
      const arrayBuffer = await file.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      if (splitMode === 'range') {
        if (mergeRanges) {
          // Create single PDF with all ranges
          const newPdf = await PDFDocument.create()
          for (const range of ranges) {
            const pageIndices = Array.from(
              { length: range.toPage - range.fromPage + 1 }, 
              (_, i) => range.fromPage - 1 + i
            )
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
            copiedPages.forEach(page => newPdf.addPage(page))
          }
          
          const pdfBytes = await newPdf.save()
          const blob = new Blob([pdfBytes], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${file.name.replace('.pdf', '')}-merged-ranges.pdf`
          link.click()
          URL.revokeObjectURL(url)
        } else {
          // Create separate PDF for each range
          for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i]
            const newPdf = await PDFDocument.create()
            const pageIndices = Array.from(
              { length: range.toPage - range.fromPage + 1 }, 
              (_, j) => range.fromPage - 1 + j
            )
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
            copiedPages.forEach(page => newPdf.addPage(page))
            
            const pdfBytes = await newPdf.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${file.name.replace('.pdf', '')}-range-${i + 1}.pdf`
            link.click()
            URL.revokeObjectURL(url)
          }
        }
      } else if (splitMode === 'pages') {
        if (extractMode === 'all') {
          // Extract each page as separate PDF
          for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const newPdf = await PDFDocument.create()
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
            newPdf.addPage(copiedPage)
            
            const pdfBytes = await newPdf.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${file.name.replace('.pdf', '')}-page-${i + 1}.pdf`
            link.click()
            URL.revokeObjectURL(url)
          }
        } else {
          // Extract selected pages
          const selectedPageNumbers = selectedPages
            .split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => !isNaN(p) && p > 0 && p <= pdfDoc.getPageCount())
          
          if (mergeExtracted) {
            const newPdf = await PDFDocument.create()
            const copiedPages = await newPdf.copyPages(pdfDoc, selectedPageNumbers.map(p => p - 1))
            copiedPages.forEach(page => newPdf.addPage(page))
            
            const pdfBytes = await newPdf.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${file.name.replace('.pdf', '')}-selected-pages.pdf`
            link.click()
            URL.revokeObjectURL(url)
          } else {
            for (const pageNum of selectedPageNumbers) {
              const newPdf = await PDFDocument.create()
              const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1])
              newPdf.addPage(copiedPage)
              
              const pdfBytes = await newPdf.save()
              const blob = new Blob([pdfBytes], { type: 'application/pdf' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${file.name.replace('.pdf', '')}-page-${pageNum}.pdf`
              link.click()
              URL.revokeObjectURL(url)
            }
          }
        }
      }
      
      showToast('PDF split successfully!', 'success')
    } catch (error) {
      console.error("Split failed:", error)
      showToast('Failed to split PDF. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const currentFile = files[0]

  // Add this function to generate thumbnails
  const generateThumbnail = async (pdfDoc: PDFDocument, pageIndex: number): Promise<string> => {
    try {
      // Create a new document with just this page
      const thumbnailDoc = await PDFDocument.create()
      const [copiedPage] = await thumbnailDoc.copyPages(pdfDoc, [pageIndex])
      thumbnailDoc.addPage(copiedPage)
      
      // Convert to data URL for display
      const pdfBytes = await thumbnailDoc.saveAsBase64({ dataUri: true })
      return pdfBytes
    } catch (error) {
      console.error("Error generating thumbnail:", error)
      return ''
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Scissors className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Split PDF files</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Split your PDF into multiple files. Extract specific pages or ranges.
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select PDF file</h3>
            <p className="text-gray-600 mb-6">or drop PDF here</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Select PDF file
            </Button>
            <input
              type="file"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Configuration */}
            <div className="space-y-6">
              {/* Split Mode Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Split</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setSplitMode('range')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                      splitMode === 'range' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative mb-3">
                      <div className="w-8 h-10 border-2 border-gray-400 rounded-sm bg-white"></div>
                      <div className="absolute -right-1 -bottom-1 w-6 h-8 border-2 border-gray-400 rounded-sm bg-white"></div>
                      <div className="absolute -right-2 -bottom-2 w-4 h-6 border-2 border-gray-400 rounded-sm bg-white"></div>
                    </div>
                    {splitMode === 'range' && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Range</span>
                  </button>

                  <button
                    onClick={() => setSplitMode('pages')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                      splitMode === 'pages' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      <div className="w-3 h-4 border border-gray-400 rounded-sm bg-white"></div>
                      <div className="w-3 h-4 border border-gray-400 rounded-sm bg-white"></div>
                      <div className="w-3 h-4 border border-gray-400 rounded-sm bg-white"></div>
                      <div className="w-3 h-4 border border-gray-400 rounded-sm bg-white"></div>
                    </div>
                    {splitMode === 'pages' && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Pages</span>
                  </button>

                  <button
                    onClick={() => setSplitMode('size')}
                    disabled
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 opacity-50 cursor-not-allowed"
                  >
                    <div className="relative mb-3">
                      <div className="w-6 h-8 border-2 border-gray-400 rounded-sm bg-white"></div>
                      <div className="absolute -right-1 -bottom-1 w-8 h-6 border-2 border-gray-400 rounded-sm bg-white"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Size</span>
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      👑
                    </div>
                  </button>
                </div>

                {/* Range Mode Configuration */}
                {splitMode === 'range' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Range mode:</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setRangeMode('custom')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            rangeMode === 'custom'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Custom ranges
                        </button>
                        <button
                          onClick={() => setRangeMode('fixed')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            rangeMode === 'fixed'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Fixed ranges
                        </button>
                      </div>
                    </div>

                    {rangeMode === 'custom' && (
                      <div className="space-y-4">
                        {ranges.map((range, index) => (
                          <div key={range.id} className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700 w-16">
                              Range {index + 1}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <select
                                  value={range.fromPage}
                                  onChange={(e) => updateRange(range.id, 'fromPage', Number(e.target.value))}
                                  className="px-3 py-2 border border-gray-300 rounded bg-white text-sm appearance-none pr-8"
                                >
                                  {Array.from({ length: currentFile?.pages.length || 1 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">to</span>
                              <div className="relative">
                                <select
                                  value={range.toPage}
                                  onChange={(e) => updateRange(range.id, 'toPage', Number(e.target.value))}
                                  className="px-3 py-2 border border-gray-300 rounded bg-white text-sm appearance-none pr-8"
                                >
                                  {Array.from({ length: currentFile?.pages.length || 1 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              {ranges.length > 1 && (
                                <button
                                  onClick={() => removeRange(range.id)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <button
                          onClick={addRange}
                          className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Range
                        </button>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={mergeRanges}
                            onChange={(e) => setMergeRanges(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Merge all ranges in one PDF file.</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Pages Mode Configuration */}
                {splitMode === 'pages' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Extract mode:</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setExtractMode('all')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            extractMode === 'all'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Extract all pages
                        </button>
                        <button
                          onClick={() => setExtractMode('select')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            extractMode === 'select'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Select pages
                        </button>
                      </div>
                    </div>

                    {extractMode === 'select' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pages to extract:
                          </label>
                          <input
                            type="text"
                            value={selectedPages}
                            onChange={(e) => setSelectedPages(e.target.value)}
                            placeholder="example: 1,5-8"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                          />
                        </div>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={mergeExtracted}
                            onChange={(e) => setMergeExtracted(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Merge extracted pages into one PDF file.</span>
                        </label>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        Selected pages will be converted into separate PDF files. 
                        <strong> {calculateExpectedFiles()} PDF</strong> will be created.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={splitPDFs}
                    disabled={loading || !currentFile}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                  >
                    {loading ? "Splitting..." : "Split PDF"}
                  </Button>
                  
                  {loading && (
                    <div className="flex justify-center items-center text-blue-600 text-sm mt-3">
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      Processing PDF...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - PDF Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(currentFile.size)} • {currentFile.pages.length} pages
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(currentFile.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pages</h3>
                <div className="grid grid-cols-4 gap-3">
                  {currentFile.pages.map((page, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer border rounded p-3 flex items-center justify-center ${
                        page.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                      }`}
                      onClick={() => togglePageSelection(currentFile.id, page.pageNumber)}
                    >
                      <span className="text-sm font-medium">Page {page.pageNumber}</span>
                      {page.selected && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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

