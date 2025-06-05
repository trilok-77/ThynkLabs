"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"

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

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            <Link href="/pdf-tools" className="text-gray-700 hover:text-red-600 transition-colors">
              PDF Tools
            </Link>
            <Link href="/qr-code-and-barcode-generator" className="text-gray-700 hover:text-red-600 transition-colors">
              QR & Barcode
            </Link>
            {/* <Link href="/donate" className="text-gray-700 hover:text-red-600 transition-colors">
              Donate
            </Link> */}
            <Link href="/issues" className="text-gray-700 hover:text-red-600 transition-colors">
              Report Issues
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/pdf-tools" className="text-gray-700 hover:text-red-600">
                PDF Tools
              </Link>
              <Link href="/qr-code-and-barcode-generator" className="text-gray-700 hover:text-red-600 transition-colors">
                QR & Barcode
              </Link>
              {/* <Link href="/donate" className="text-gray-700 hover:text-red-600">
                Donate
              </Link> */}
              <Link href="/issues" className="text-gray-700 hover:text-red-600">
                Help
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
