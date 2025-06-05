"use client"

import React from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Mail, AlertTriangle, CheckCircle, HelpCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
            <p className="text-lg text-gray-600">
              We're here to help you with any issues or questions you might have.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Report an Issue
              </h2>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                <p className="text-blue-800">
                  If you encounter any bugs, errors, or have suggestions for improvements, please let us know by sending an email to:
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  <a 
                    href="mailto:trilokshettyin@gmail.com" 
                    className="text-blue-600 font-medium hover:underline"
                  >
                    trilokshettyin@gmail.com
                  </a>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">When reporting an issue, please include:</h3>
              <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
                <li>A clear description of the problem</li>
                <li>Steps to reproduce the issue</li>
                <li>Which tool you were using (e.g., PDF Merger, QR Code Generator)</li>
                <li>Your device and browser information</li>
                <li>Screenshots if possible</li>
              </ul>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-green-800">
                    We typically respond to all inquiries within 24-48 hours during business days.
                  </p>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="h-5 w-5 text-indigo-500 mr-2" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Are these tools really free?</h3>
                  <p className="text-gray-700">
                    Yes, all tools on ThynkLabs are completely free to use with no hidden fees or subscriptions.
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Is my data secure?</h3>
                  <p className="text-gray-700">
                    Absolutely. All file processing happens directly in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security.
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Are there any usage limits?</h3>
                  <p className="text-gray-700">
                    There are no artificial limits on how many files you can process or how often you can use our tools.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link href="/">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}