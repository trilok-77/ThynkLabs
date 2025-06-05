import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thynklabs.xyz'
  const currentDate = new Date().toISOString()

  // Main pages
  const routes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    
    
  ]

  // PDF Tools
  const pdfTools = [
    '/pdf-tools',
    '/merge-pdf',
    '/rotate-pdf',
    '/image-to-pdf',
    '/pdf-to-jpg',
    '/compress-pdf',
  ]

  pdfTools.forEach(tool => {
    routes.push({
      url: `${baseUrl}${tool}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })
  })

  // QR and Barcode tools
  routes.push({
    url: `${baseUrl}/qr-code-and-barcode-generator`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  })

  return routes
}
