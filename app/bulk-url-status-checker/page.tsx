/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

"use client"

import React, { useState, useEffect } from 'react';
import { Upload, X, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Globe, Download, BarChart3, Link, Clock, TrendingUp, Info } from 'lucide-react';
import Header from "@/components/header"
import Footer from "@/components/footer"

interface URLCheck {
  id: string;
  url: string;
  status: number | null;
  statusText: string;
  responseTime: number | null;
  isChecking: boolean;
  error: string | null;
  finalUrl?: string;
}

interface Stats {
  total: number;
  checked: number;
  successful: number;
  failed: number;
  pending: number;
  avgResponseTime: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const MAX_URLS = 100;

export default function BulkURLChecker() {
  const [urls, setUrls] = useState<URLCheck[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [checking, setChecking] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [csvInput, setCsvInput] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [useAlternativeMethod, setUseAlternativeMethod] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const downloadTemplate = () => {
    const csvContent = 'URL\nhttps://httpbin.org/status/200\nhttps://httpbin.org/status/404\nhttps://httpbin.org/status/500\nhttps://jsonplaceholder.typicode.com/posts/1\nhttps://api.github.com';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'url_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Template downloaded successfully!', 'success');
  };

  const parseCSV = (csvText: string): string[] => {
    const lines = csvText.trim().split('\n');
    const urls: string[] = [];
    
    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('url')) {
        return;
      }
      
      const url = line.trim();
      
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        urls.push(url);
      }
    });
    
    return urls;
  };

  const addUrlsFromCSV = (csvText: string) => {
    try {
      const parsedUrls = parseCSV(csvText);
      
      if (parsedUrls.length === 0) {
        showToast('No valid URLs found in CSV', 'error');
        return;
      }

      if (parsedUrls.length > MAX_URLS) {
        showToast(`Too many URLs! Maximum allowed: ${MAX_URLS}. Only first ${MAX_URLS} will be added.`, 'warning');
        parsedUrls.splice(MAX_URLS);
      }

      const urlObjects: URLCheck[] = parsedUrls.map((url) => ({
        id: Math.random().toString(36).substr(2, 9),
        url,
        status: null,
        statusText: 'Pending',
        responseTime: null,
        isChecking: false,
        error: null,
      }));

      setUrls(prev => [...prev, ...urlObjects]);
      setCsvInput('');
      setShowPasteArea(false);
      showToast(`Added ${urlObjects.length} URLs successfully!`, 'success');
    } catch (error) {
      showToast('Failed to parse CSV. Please check the format.', 'error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFile = droppedFiles.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target?.result as string;
        addUrlsFromCSV(csvText);
      };
      reader.readAsText(csvFile);
    } else {
      showToast('Please drop a CSV file', 'error');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        addUrlsFromCSV(csvText);
      };
      reader.readAsText(file);
    } else {
      showToast('Please select a valid CSV file', 'error');
    }
  };

  const removeUrl = (id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id));
  };

  const moveUrl = (id: string, direction: "up" | "down") => {
    setUrls(prev => {
      const index = prev.findIndex(url => url.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newUrls = [...prev];
      const [movedUrl] = newUrls.splice(index, 1);
      newUrls.splice(newIndex, 0, movedUrl);
      return newUrls;
    });
  };

  const checkUrlStatus = async (url: string): Promise<{ status: number; statusText: string; responseTime: number; finalUrl?: string }> => {
    const startTime = Date.now();
    
    try {
      // Try multiple CORS proxy services
      const proxyServices = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      ];

      let lastError = null;
      
      for (const proxyUrl of proxyServices) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          
          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;
          
          if (response.ok || response.status < 500) {
            return {
              status: response.status,
              statusText: response.statusText || getStatusText(response.status),
              responseTime,
              finalUrl: response.url !== proxyUrl ? response.url : undefined,
            };
          }
          
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        } catch (error: any) {
          lastError = error.name === 'AbortError' ? 'Request timeout' : error.message;
          continue;
        }
      }
      
      // If all proxy services fail, try direct fetch (will work for same-origin or CORS-enabled sites)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          method: 'HEAD', // Use HEAD to minimize data transfer
          signal: controller.signal,
          mode: 'cors',
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        return {
          status: response.status,
          statusText: response.statusText || getStatusText(response.status),
          responseTime,
        };
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        return {
          status: 0,
          statusText: 'CORS/Network Error',
          responseTime,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        status: 0,
        statusText: error.message || 'Unknown Error',
        responseTime,
      };
    }
  };

  const getStatusText = (status: number): string => {
    const statusTexts: { [key: number]: string } = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return statusTexts[status] || 'Unknown Status';
  };

  const checkAllUrls = async () => {
    if (urls.length === 0) {
      showToast('No URLs to check', 'warning');
      return;
    }

    setChecking(true);
    
    const batchSize = 3; // Reduced batch size for better reliability
    const batches = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      setUrls(prev => prev.map(url => 
        batch.some(batchUrl => batchUrl.id === url.id) 
          ? { ...url, isChecking: true }
          : url
      ));

      const promises = batch.map(async (urlObj) => {
        try {
          const result = await checkUrlStatus(urlObj.url);
          
          setUrls(prev => prev.map(url => 
            url.id === urlObj.id 
              ? {
                  ...url,
                  status: result.status,
                  statusText: result.statusText,
                  responseTime: result.responseTime,
                  isChecking: false,
                  error: result.status === 0 ? result.statusText : null,
                  finalUrl: result.finalUrl,
                }
              : url
          ));
        } catch (error: any) {
          setUrls(prev => prev.map(url => 
            url.id === urlObj.id 
              ? {
                  ...url,
                  status: 0,
                  statusText: 'Check Failed',
                  responseTime: null,
                  isChecking: false,
                  error: error.message || 'Unknown error',
                }
              : url
          ));
        }
      });

      await Promise.all(promises);
      
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay between batches
      }
    }

    setChecking(false);
    showToast('URL checking completed!', 'success');
  };

  const getStats = (): Stats => {
    const total = urls.length;
    const checked = urls.filter(url => url.status !== null).length;
    const successful = urls.filter(url => url.status && url.status >= 200 && url.status < 400).length;
    const failed = urls.filter(url => url.status && (url.status >= 400 || url.status === 0)).length;
    const pending = total - checked;
    
    const responseTimes = urls.filter(url => url.responseTime !== null).map(url => url.responseTime!);
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    return { total, checked, successful, failed, pending, avgResponseTime };
  };

  const exportResults = () => {
    const csvHeader = 'URL,Status Code,Status Text,Response Time (ms),Error,Final URL\n';
    const csvContent = urls.map(url => 
      `"${url.url}",${url.status || 'N/A'},"${url.statusText}",${url.responseTime || 'N/A'},"${url.error || ''}","${url.finalUrl || ''}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'url_check_results.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Results exported successfully!', 'success');
  };

  const getStatusColor = (status: number | null) => {
    if (status === null) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400) return 'text-red-600';
    return 'text-gray-500';
  };

  const stats = getStats();

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
                : toast.type === 'error'
                ? 'bg-white border-l-red-500 text-red-800'
                : 'bg-white border-l-yellow-500 text-yellow-800'
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Bulk URL Status Checker</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Check the status of multiple URLs at once. Upload CSV, paste URLs, or use our template.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Maximum {MAX_URLS} URLs allowed to prevent server overload
          </p>
          
          {/* CORS Notice */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">CORS Limitations Notice:</p>
                <p>Some websites (like Google, Facebook) may show "Network Error" due to CORS restrictions. This is normal and doesn't indicate the site is down. Use API endpoints or testing URLs for best results.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        {urls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total URLs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.checked}</p>
                  <p className="text-sm text-gray-600">Checked</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{stats.avgResponseTime}ms</p>
                  <p className="text-sm text-gray-600">Avg Response</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {urls.length === 0 ? (
          <div className="space-y-6">
            {/* Upload Area */}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload CSV file</h3>
              <p className="text-gray-600 mb-6">or drop CSV file here</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Select CSV File
                </button>
                
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download Template
                </button>
                
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => setShowPasteArea(!showPasteArea)}
                >
                  Paste URLs
                </button>
              </div>
              
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
            </div>

            {/* Paste Area */}
            {showPasteArea && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paste CSV Content</h3>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Paste your CSV content here...&#10;Format: One URL per line&#10;https://httpbin.org/status/200&#10;https://jsonplaceholder.typicode.com/posts/1&#10;https://api.github.com"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => addUrlsFromCSV(csvInput)}
                    disabled={!csvInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add URLs
                  </button>
                  <button
                    onClick={() => {
                      setCsvInput('');
                      setShowPasteArea(false);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add More URLs
                </button>
                <button
                  onClick={() => setShowPasteArea(!showPasteArea)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Paste URLs
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={exportResults}
                  disabled={stats.checked === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Export Results
                </button>
                <button
                  onClick={checkAllUrls}
                  disabled={checking}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {checking ? "Checking..." : "Check All URLs"}
                </button>
              </div>
            </div>

            {/* Paste Area */}
            {showPasteArea && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add More URLs</h3>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Paste your CSV content here...&#10;Format: One URL per line&#10;https://httpbin.org/status/200&#10;https://api.github.com"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => addUrlsFromCSV(csvInput)}
                    disabled={!csvInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add URLs
                  </button>
                  <button
                    onClick={() => {
                      setCsvInput('');
                      setShowPasteArea(false);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* URL List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">URLs to Check ({urls.length})</h3>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {urls.map((url, index) => (
                  <div key={url.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          {url.isChecking ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          ) : (
                            <Link className="h-4 w-4 text-gray-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{url.url}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-sm font-medium ${getStatusColor(url.status)}`}>
                                {url.status ? `${url.status} - ${url.statusText}` : url.statusText}
                              </span>
                              {url.responseTime && (
                                <span className="text-sm text-gray-500">
                                  {url.responseTime}ms
                                </span>
                              )}
                              {url.error && (
                                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                                  {url.error}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeUrl(url.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
