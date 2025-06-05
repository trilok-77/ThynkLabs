"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="font-[Montserrat] text-xl tracking-tight flex items-center">
              <span className="font-bold text-red-600 mr-0.5">Thynk</span>
              <span className="font-normal text-gray-800">Labs</span>
            </div>
          </Link>

          {/* Desktop Navigation - ONLY visible on md and larger screens */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/pdf-tools" className="text-gray-700 hover:text-red-600 transition-colors">
              PDF Tools
            </Link>
            <Link href="/qr-code-and-barcode-generator" className="text-gray-700 hover:text-red-600 transition-colors">
              QR & Barcode
            </Link>
            <Link href="/issues" className="text-gray-700 hover:text-red-600 transition-colors">
              Report Issues
            </Link>
          </nav>

          {/* Mobile menu button - ONLY visible on smaller than md screens */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Navigation - ONLY shown when menu is open AND on smaller than md screens */}
        {isMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex flex-col">
              <Link 
                href="/pdf-tools" 
                className="py-3 px-4 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                PDF Tools
              </Link>
              <Link 
                href="/qr-code-and-barcode-generator" 
                className="py-3 px-4 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                QR & Barcode
              </Link>
              <Link 
                href="/issues" 
                className="py-3 px-4 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Report Issues
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
