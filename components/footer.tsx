import Link from "next/link"
import { FileText, QrCode, Scissors, Rotate3D, Image, FileUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-300 hover:text-white transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/merge-pdf" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/organize-pdf" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Scissors className="h-4 w-4 mr-2" />
                  Organize PDF
                </Link>
              </li>
              <li>
                <Link href="/rotate-pdf" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Rotate3D className="h-4 w-4 mr-2" />
                  Rotate PDF
                </Link>
              </li>
              <li>
                <Link href="/image-to-pdf" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Image to PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Other Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Other Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/qr-code-and-barcode-generator" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link href="/qr-code-and-barcode-generator?tab=barcode" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  Barcode Generator
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-jpg" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FileUp className="h-4 w-4 mr-2" />
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link href="/word-to-pdf" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Word to PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:trilokshettyin@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li className="pt-2 text-gray-400 text-sm">
                <p>For support or feedback:</p>
                <p className="font-medium">trilokshettyin@gmail.com</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="font-[Montserrat] text-xl">
                <span className="font-bold text-red-600 mr-0.5">Thynk</span>
                <span className="font-normal text-gray-300">Labs</span>
              </div>
              <p className="text-gray-400 ml-4">© 2024 Thynk Labs. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
