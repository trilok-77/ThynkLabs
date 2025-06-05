"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { QrCode, BarChart3, Download, Copy, CheckCircle, AlertCircle, X, Settings, Palette, RefreshCw, ChevronDown ,Barcode} from "lucide-react"
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import Footer from "@/components/footer"
import Header from "@/components/header"

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

interface QRCodeOptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  type: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number
  margin: number
  color: {
    dark: string
    light: string
  }
  width: number
}

interface BarcodeOptions {
  format: string
  displayValue: boolean
  fontSize: number
  textAlign: string
  textPosition: string
  textMargin: number
  fontOptions: string
  font: string
  fontColor: string
  background: string
  lineColor: string
  width: number
  height: number
  margin: number
}

// Common QR Code types (most used first)
const QR_TYPES = [
  { value: 'text', label: 'Text/URL (Default)', placeholder: 'Enter any text or URL...' },
  { value: 'wifi', label: 'WiFi Network', placeholder: 'WIFI:T:WPA;S:NetworkName;P:Password;H:false;;' },
  { value: 'email', label: 'Email', placeholder: 'mailto:someone@example.com?subject=Hello' },
  { value: 'phone', label: 'Phone Number', placeholder: 'tel:+1234567890' },
  { value: 'sms', label: 'SMS Message', placeholder: 'SMSTO:+1234567890:Hello there!' },
  { value: 'vcard', label: 'Contact Card', placeholder: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD' }
]

// Common Barcode formats (most used first)
const BARCODE_FORMATS = [
  { value: 'CODE128', label: 'Code 128 (Default)', description: 'Most versatile, supports all ASCII characters' },
  { value: 'EAN13', label: 'EAN-13', description: 'Product barcodes (13 digits)' },
  { value: 'EAN8', label: 'EAN-8', description: 'Short product barcodes (8 digits)' },
  { value: 'UPC', label: 'UPC-A', description: 'US product barcodes (12 digits)' },
  { value: 'CODE39', label: 'Code 39', description: 'Alphanumeric, widely used' },
  { value: 'ITF14', label: 'ITF-14', description: 'Shipping containers (14 digits)' },
  { value: 'MSI', label: 'MSI', description: 'Inventory and retail' },
  { value: 'pharmacode', label: 'Pharmacode', description: 'Pharmaceutical packaging' }
]

export default function QRBarcodeGenerator() {
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>('qr')
  const [inputText, setInputText] = useState('')
  const [qrType, setQrType] = useState('text')
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128')
  
  // Add this useEffect to handle URL parameters for tab switching
  useEffect(() => {
    // Check URL parameters for tab selection
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'barcode') {
      setActiveTab('barcode');
    }
  }, []);
  
  const [qrOptions, setQROptions] = useState<QRCodeOptions>({
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    width: 256
  })
  const [barcodeOptions, setBarcodeOptions] = useState<BarcodeOptions>({
    format: 'CODE128',
    displayValue: true,
    fontSize: 20,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontOptions: '',
    font: 'monospace',
    fontColor: '#000000',
    background: '#ffffff',
    lineColor: '#000000',
    width: 2,
    height: 100,
    margin: 10
  })
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // QR Code generation using qrcode library
  const generateQRCode = async () => {
    if (!inputText.trim()) {
      showToast('Please enter text to generate QR code', 'error')
      return
    }

    setLoading(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      // Generate QR code using the npm package
      await QRCode.toCanvas(canvas, inputText, {
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        type: qrOptions.type,
        quality: qrOptions.quality,
        margin: qrOptions.margin,
        color: qrOptions.color,
        width: qrOptions.width
      })

      const dataURL = canvas.toDataURL('image/png')
      setGeneratedImage(dataURL)
      showToast('QR code generated successfully!', 'success')
    } catch (error) {
      console.error('QR generation error:', error)
      showToast('Failed to generate QR code. Please check your input.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Barcode generation using jsbarcode library
  const generateBarcode = async () => {
    if (!inputText.trim()) {
      showToast('Please enter text to generate barcode', 'error')
      return
    }

    setLoading(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      // Update barcode format in options
      const currentOptions = { ...barcodeOptions, format: barcodeFormat }

      // Generate barcode using JsBarcode npm package
      JsBarcode(canvas, inputText, {
        format: currentOptions.format,
        displayValue: currentOptions.displayValue,
        fontSize: currentOptions.fontSize,
        textAlign: currentOptions.textAlign,
        textPosition: currentOptions.textPosition,
        textMargin: currentOptions.textMargin,
        fontOptions: currentOptions.fontOptions,
        font: currentOptions.font,
        fontColor: currentOptions.fontColor,
        background: currentOptions.background,
        lineColor: currentOptions.lineColor,
        width: currentOptions.width,
        height: currentOptions.height,
        margin: currentOptions.margin
      })

      const dataURL = canvas.toDataURL('image/png')
      setGeneratedImage(dataURL)
      showToast('Barcode generated successfully!', 'success')
    } catch (error) {
      console.error('Barcode generation error:', error)
      showToast('Failed to generate barcode. Please check your input and format.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.download = `${activeTab}-${Date.now()}.png`
    link.href = generatedImage
    link.click()
    showToast(`${activeTab.toUpperCase()} downloaded successfully!`, 'success')
  }

  const copyToClipboard = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      showToast('Image copied to clipboard!', 'success')
    } catch (error) {
      showToast('Failed to copy image', 'error')
    }
  }

  const resetOptions = () => {
    if (activeTab === 'qr') {
      setQROptions({
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        width: 256
      })
      setQrType('text')
    } else {
      setBarcodeOptions({
        format: 'CODE128',
        displayValue: true,
        fontSize: 20,
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2,
        fontOptions: '',
        font: 'monospace',
        fontColor: '#000000',
        background: '#ffffff',
        lineColor: '#000000',
        width: 2,
        height: 100,
        margin: 10
      })
      setBarcodeFormat('CODE128')
    }
    showToast('Options reset to default', 'success')
  }

  const presetColors = [
    { name: 'Classic Black', fg: '#000000', bg: '#ffffff' },
    { name: 'Ocean Blue', fg: '#1e40af', bg: '#eff6ff' },
    { name: 'Forest Green', fg: '#166534', bg: '#f0fdf4' },
    { name: 'Royal Purple', fg: '#7c3aed', bg: '#faf5ff' },
    { name: 'Sunset Orange', fg: '#ea580c', bg: '#fff7ed' },
    { name: 'Rose Pink', fg: '#e11d48', bg: '#fff1f2' },
  ]

  const applyColorPreset = (fg: string, bg: string) => {
    if (activeTab === 'qr') {
      setQROptions(prev => ({ 
        ...prev, 
        color: { dark: fg, light: bg }
      }))
    } else {
      setBarcodeOptions(prev => ({ 
        ...prev, 
        fontColor: fg, 
        background: bg,
        lineColor: fg
      }))
    }
  }

  const getCurrentPlaceholder = () => {
    if (activeTab === 'qr') {
      const selectedType = QR_TYPES.find(type => type.value === qrType)
      return selectedType?.placeholder || 'Enter text...'
    } else {
      const selectedFormat = BARCODE_FORMATS.find(format => format.value === barcodeFormat)
      if (selectedFormat?.value === 'EAN13') return '1234567890123 (13 digits)'
      if (selectedFormat?.value === 'EAN8') return '12345678 (8 digits)'
      if (selectedFormat?.value === 'UPC') return '123456789012 (12 digits)'
      if (selectedFormat?.value === 'ITF14') return '12345678901234 (14 digits)'
      return 'Enter text for barcode...'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* SEO Meta Tags */}
        <head>
          <title>Free QR Code & Barcode Generator Online - Create Custom QR Codes</title>
          <meta name="description" content="Generate high-quality QR codes and barcodes online for free. Create custom QR codes for URLs, WiFi, contacts, and more. Download as PNG with advanced styling options." />
          <meta name="keywords" content="QR code generator, barcode generator, free QR code, custom QR code, WiFi QR code, contact QR code, URL QR code, EAN barcode, UPC barcode" />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="canonical" href="https://thynklabs.xyz/qr-code-and-barcode-generator" />
          <meta property="og:title" content="Free QR Code & Barcode Generator Online" />
          <meta property="og:description" content="Create custom QR codes and barcodes instantly. Free online tool with advanced styling options." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://thynklabs.xyz/qr-code-and-barcode-generator" />
        </head>
      <Header />
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 min-w-80 transform transition-all duration-300 ease-in-out backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-white/90 border-l-green-500 text-green-800'
                : 'bg-white/90 border-l-red-500 text-red-800'
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl">
            {activeTab === 'qr' ? (
              <QrCode className="h-12 w-12 text-white" />
            ) : (
              <Barcode className="h-12 w-12 text-white" />
            )}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            QR Code & Barcode Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate high-quality QR codes and barcodes with custom styling options. Perfect for business cards, products, and digital content.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'qr'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <QrCode className="h-5 w-5" />
                <span>QR Code</span>
              </button>
              <button
                onClick={() => setActiveTab('barcode')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'barcode'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Barcode className="h-5 w-5" />
                <span>Barcode</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input and Options Panel */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <span>Configuration</span>
            </h3>

            {/* Type/Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTab === 'qr' ? 'QR Code Type' : 'Barcode Format'}
              </label>
              {activeTab === 'qr' ? (
                <select
                  value={qrType}
                  onChange={(e) => setQrType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                >
                  {QR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
                >
                  {BARCODE_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label} - {format.description}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Input Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter text or data
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getCurrentPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 bg-white/80"
              />
            </div>

            {/* Color Presets */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Color Presets</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset.fg, preset.bg)}
                    className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex space-x-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: preset.fg }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: preset.bg }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Settings className="h-4 w-4" />
                <span>Advanced Options</span>
                <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                {activeTab === 'qr' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Error Correction Level</label>
                      <select
                        value={qrOptions.errorCorrectionLevel}
                        onChange={(e) => setQROptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Size (Width)</label>
                      <input
                        type="range"
                        min="128"
                        max="512"
                        value={qrOptions.width}
                        onChange={(e) => setQROptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">{qrOptions.width}px</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Foreground</label>
                        <input
                          type="color"
                          value={qrOptions.color.dark}
                          onChange={(e) => setQROptions(prev => ({ ...prev, color: { ...prev.color, dark: e.target.value } }))}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                        <input
                          type="color"
                          value={qrOptions.color.light}
                          onChange={(e) => setQROptions(prev => ({ ...prev, color: { ...prev.color, light: e.target.value } }))}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Line Color</label>
                        <input
                          type="color"
                          value={barcodeOptions.lineColor}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, lineColor: e.target.value }))}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                        <input
                          type="color"
                          value={barcodeOptions.background}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, background: e.target.value }))}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Height</label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={barcodeOptions.height}
                        onChange={(e) => setBarcodeOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">{barcodeOptions.height}px</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="displayValue"
                        checked={barcodeOptions.displayValue}
                        onChange={(e) => setBarcodeOptions(prev => ({ ...prev, displayValue: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="displayValue" className="text-sm text-gray-700">
                        Display text below barcode
                      </label>
                    </div>
                  </>
                )}
                <button
                  onClick={resetOptions}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset to defaults</span>
                </button>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={activeTab === 'qr' ? generateQRCode : generateBarcode}
              disabled={loading || !inputText.trim()}
              className={`w-full py-4 text-lg font-semibold ${
                activeTab === 'qr'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              } text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </div>
              ) : (
                `Generate ${activeTab === 'qr' ? 'QR Code' : 'Barcode'}`
              )}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Preview</h3>
            
            <div className="bg-gray-50/80 rounded-xl p-8 min-h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
              {generatedImage ? (
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={generatedImage} 
                      alt={`Generated ${activeTab}`}
                      className="max-w-full max-h-64 shadow-lg rounded-lg border border-gray-200 bg-white p-4"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={downloadImage}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex items-center space-x-2 px-4 py-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  {activeTab === 'qr' ? (
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  ) : (
                    <Barcode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  )}
                  <p className="text-lg">
                    Your {activeTab === 'qr' ? 'QR code' : 'barcode'} will appear here
                  </p>
                  <p className="text-sm mt-2">
                    Enter text and click generate to start
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {inputText && !generatedImage && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Ready to generate! Click the button above to create your {activeTab === 'qr' ? 'QR code' : 'barcode'}.
                </p>
              </div>
            )}

            
            
            {/* Format Information */}
            {activeTab === 'barcode' && barcodeFormat && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Format Info:</h4>
                <p className="text-sm text-purple-700">
                  {BARCODE_FORMATS.find(f => f.value === barcodeFormat)?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Examples */}
<div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Examples & Templates</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* QR Code Examples */}
    <div>
      <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center space-x-2">
        <QrCode className="h-5 w-5" />
        <span>QR Code Examples</span>
      </h3>
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong className="text-sm text-blue-800">Website URL:</strong>
          <p className="text-sm text-blue-700 font-mono">https://example.com</p>
          <p className="text-xs text-blue-600 mt-1">Perfect for business cards and marketing materials</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong className="text-sm text-blue-800">WiFi Network:</strong>
          <p className="text-sm text-blue-700 font-mono">WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;</p>
          <p className="text-xs text-blue-600 mt-1">Let guests connect instantly without typing passwords</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong className="text-sm text-blue-800">Email Contact:</strong>
          <p className="text-sm text-blue-700 font-mono">mailto:contact@example.com?subject=Inquiry</p>
          <p className="text-xs text-blue-600 mt-1">Pre-filled email with subject line</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong className="text-sm text-blue-800">Phone Number:</strong>
          <p className="text-sm text-blue-700 font-mono">tel:+1234567890</p>
          <p className="text-xs text-blue-600 mt-1">One-tap dialing for customers</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong className="text-sm text-blue-800">SMS Message:</strong>
          <p className="text-sm text-blue-700 font-mono">SMSTO:+1234567890:Hello, I'm interested!</p>
          <p className="text-xs text-blue-600 mt-1">Pre-written text message for leads</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong className="text-sm text-blue-800">vCard Contact:</strong>
          <p className="text-sm text-blue-700 font-mono">BEGIN:VCARD VERSION:3.0 FN:John Doe TEL:+123 EMAIL:john@example.com END:VCARD</p>
          <p className="text-xs text-blue-600 mt-1">Complete contact information for easy saving</p>
        </div>
      </div>
    </div>

    {/* Barcode Examples */}
    <div>
      <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center space-x-2">
        <Barcode className="h-5 w-5" />
        <span>Barcode Examples</span>
      </h3>
      <div className="space-y-3">
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong className="text-sm text-purple-800">Code 128 (Default):</strong>
          <p className="text-sm text-purple-700 font-mono">ABC123def456</p>
          <p className="text-xs text-purple-600 mt-1">Most versatile format, supports all characters</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong className="text-sm text-purple-800">EAN-13 Product Code:</strong>
          <p className="text-sm text-purple-700 font-mono">1234567890123</p>
          <p className="text-xs text-purple-600 mt-1">International product identification (13 digits)</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong className="text-sm text-purple-800">EAN-8 Short Code:</strong>
          <p className="text-sm text-purple-700 font-mono">12345678</p>
          <p className="text-xs text-purple-600 mt-1">Compact version for small products (8 digits)</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong className="text-sm text-purple-800">UPC-A US Products:</strong>
          <p className="text-sm text-purple-700 font-mono">123456789012</p>
          <p className="text-xs text-purple-600 mt-1">Standard US retail product codes (12 digits)</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong className="text-sm text-purple-800">Code 39 Industrial:</strong>
          <p className="text-sm text-purple-700 font-mono">HELLO123</p>
          <p className="text-xs text-purple-600 mt-1">Alphanumeric codes for inventory and shipping</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong className="text-sm text-purple-800">ITF-14 Shipping:</strong>
          <p className="text-sm text-purple-700 font-mono">12345678901234</p>
          <p className="text-xs text-purple-600 mt-1">Logistics and shipping containers (14 digits)</p>
        </div>
      </div>
    </div>
  </div>
</div>
{/* FAQ Section */}
<div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
  
  <div className="space-y-4">
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
        <span>How do I create a QR code for free?</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      <div className="px-4 pb-3 text-gray-700">
        Simply enter your text, URL, or data in the input field above, select your QR code type, and click "Generate QR Code". Our tool creates high-quality QR codes instantly for free with no registration required.
      </div>
    </div>
    
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
        <span>What's the difference between QR codes and barcodes?</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      <div className="px-4 pb-3 text-gray-700">
        QR codes can store much more data (up to 4,296 characters) and can be scanned from any direction. Traditional barcodes store less data but are widely used in retail. QR codes can contain URLs, contact info, WiFi credentials, while barcodes typically contain product identifiers.
      </div>
    </div>
    
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
        <span>Can I customize the colors and design of my QR code?</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      <div className="px-4 pb-3 text-gray-700">
        Yes! Our generator offers advanced customization options including custom colors, size adjustment, error correction levels, and various design presets. You can match your QR code to your brand colors while maintaining scannability.
      </div>
    </div>
    
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
        <span>Which barcode format should I use?</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      <div className="px-4 pb-3 text-gray-700">
        Code 128 is the most versatile for general use. Use EAN-13 for retail products, UPC-A for US products, Code 39 for inventory systems, and ITF-14 for shipping containers. Each format has specific use cases and digit requirements.
      </div>
    </div>
    
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
        <span>Are the generated QR codes and barcodes permanent?</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      <div className="px-4 pb-3 text-gray-700">
        Yes, once generated and downloaded, your QR codes and barcodes are permanent image files. They don't expire and will work indefinitely. However, if you created a QR code linking to a website, make sure that website remains accessible.
      </div>
    </div>
    
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
        <span>What file formats can I download?</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      <div className="px-4 pb-3 text-gray-700">
        Currently, all QR codes and barcodes are generated as high-quality PNG files, which provide the best balance of quality and compatibility across all devices and printing systems.
      </div>
    </div>
  </div>
</div>
      </main>
      <Footer />
    </div>
  )
}
