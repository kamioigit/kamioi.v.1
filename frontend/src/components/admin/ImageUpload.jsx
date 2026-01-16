import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react'

const ImageUpload = ({ 
  onImageUploaded, 
  existingImages = [], 
  maxImages = 1,
  label = "Upload Images",
  accept = "image/*"
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // Check if adding these files would exceed maxImages
    if (existingImages.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} image${maxImages > 1 ? 's' : ''} allowed`)
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const adminToken = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

      const uploadedImages = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('image', file)

        const xhr = new XMLHttpRequest()

        await new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = ((i * 100 + (e.loaded / e.total) * 100) / files.length)
              setUploadProgress(percentComplete)
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText)
                if (response.success && response.data) {
                  // Use the URL from the backend response
                  let imageUrl = response.data.url || response.data
                  // If URL is relative, prepend backend base URL
                  if (imageUrl.startsWith('/')) {
                    const backendBaseUrl = apiBaseUrl.replace('/api', '')
                    imageUrl = `${backendBaseUrl}${imageUrl}`
                  }
                  uploadedImages.push({
                    url: imageUrl,
                    alt_text: file.name.replace(/\.[^/.]+$/, ""),
                    caption: ""
                  })
                  resolve()
                } else {
                  reject(new Error(response.error || 'Upload failed'))
                }
              } catch (e) {
                reject(new Error('Invalid response from server'))
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener('error', () => reject(new Error('Upload failed')))
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

          xhr.open('POST', `${apiBaseUrl}/api/admin/content/images/upload`)
          xhr.setRequestHeader('Authorization', `Bearer ${adminToken}`)
          xhr.send(formData)
        })
      }

      if (onImageUploaded) {
        onImageUploaded(uploadedImages)
      }

      setUploadProgress(100)
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (err) {
      console.error('Image upload error:', err)
      setError(err.message || 'Failed to upload image. Please try again.')
      setUploading(false)
      setUploadProgress(0)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    if (onImageUploaded) {
      const newImages = existingImages.filter((_, i) => i !== index)
      onImageUploaded(newImages, true) // Pass true to indicate removal
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      
      {/* Upload Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${uploading 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/5'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxImages > 1}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400" />
            <p className="text-sm text-gray-400">Uploading... {Math.round(uploadProgress)}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {maxImages > 1 ? `Up to ${maxImages} images` : 'Single image'} • PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Existing Images Preview */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {existingImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <img
                  src={image.url}
                  alt={image.alt_text || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {image.alt_text && (
                <p className="text-xs text-gray-400 mt-1 truncate">{image.alt_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUpload

