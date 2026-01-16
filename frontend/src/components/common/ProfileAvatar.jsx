import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Upload, AlertTriangle, User, CheckCircle } from 'lucide-react'

const ProfileAvatar = ({ 
  user, 
  size = 'md', 
  showUploadOnHover = true, 
  onImageUpdate = null,
  className = '',
  dashboardType = 'user' // Add dashboardType prop to differentiate between dashboards
}) => {
  const { isLightMode } = useTheme()
  const [profileImage, setProfileImage] = useState(user?.profileImage || null)
  const [isHovering, setIsHovering] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)

  // Size configurations
  const sizeConfig = {
    sm: { wrapper: 'w-6 h-6', text: 'text-xs', icon: 'w-3 h-3' },
    md: { wrapper: 'w-8 h-8', text: 'text-sm', icon: 'w-4 h-4' },
    lg: { wrapper: 'w-12 h-12', text: 'text-lg', icon: 'w-6 h-6' },
    xl: { wrapper: 'w-16 h-16', text: 'text-xl', icon: 'w-8 h-8' },
    '2xl': { wrapper: 'w-20 h-20', text: 'text-2xl', icon: 'w-10 h-10' }
  }

  const config = sizeConfig[size] || sizeConfig.md

  // Clear old profile images to free up localStorage space
  const clearOldProfileImages = () => {
    const keys = Object.keys(localStorage)
    const profileImageKeys = keys.filter(key => key.startsWith('profile_image_'))
    
    // Keep only the current user's images
    const currentUserKeys = getAllPossibleProfileImageKeys()
    const keysToRemove = profileImageKeys.filter(key => !currentUserKeys.includes(key))
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🖼️ Removed old profile image: ${key}`)
    })
    
    if (keysToRemove.length > 0) {
      console.log(`🖼️ Cleared ${keysToRemove.length} old profile images`)
    }
  }

  // Compress image to reduce file size for localStorage
  const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          try {
            // Calculate new dimensions
            let { width, height } = img
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }
            
            // Ensure minimum dimensions
            width = Math.max(width, 50)
            height = Math.max(height, 50)
            
            // Set canvas dimensions
            canvas.width = width
            canvas.height = height
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
            
            console.log(`🖼️ Image compressed: ${file.size} bytes → ${compressedDataUrl.length} characters`)
            resolve(compressedDataUrl)
          } catch (drawError) {
            console.error('🖼️ Error drawing image to canvas:', drawError)
            reject(new Error('Failed to process image: ' + drawError.message))
          }
        }
        
        img.onerror = (error) => {
          console.error('🖼️ Error loading image:', error)
          reject(new Error('Failed to load image. Please try a different file.'))
        }
        
        img.src = URL.createObjectURL(file)
      } catch (error) {
        console.error('🖼️ Error in compressImage:', error)
        reject(new Error('Failed to start image compression: ' + error.message))
      }
    })
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      console.log('🖼️ Image upload started:', { fileName: file.name, fileSize: file.size, fileType: file.type })
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file.')
        setShowErrorModal(true)
        return
      }

      // Validate file size (max 10MB for compression)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 10MB.')
        setShowErrorModal(true)
        return
      }

      try {
        // Clear old profile images to free up space
        clearOldProfileImages()
        
        let imageUrl
        
        try {
          // Try to compress the image first
          console.log('🖼️ Compressing image...')
          imageUrl = await compressImage(file, 200, 200, 0.7)
          console.log('🖼️ Image compressed successfully')
        } catch (compressionError) {
          console.warn('🖼️ Compression failed, trying without compression:', compressionError)
          
          // Fallback: try without compression for smaller files
          if (file.size < 1024 * 1024) { // Less than 1MB
            console.log('🖼️ Using original image (small file)')
            const reader = new FileReader()
            imageUrl = await new Promise((resolve, reject) => {
              reader.onload = (e) => resolve(e.target.result)
              reader.onerror = () => reject(new Error('Failed to read file'))
              reader.readAsDataURL(file)
            })
          } else {
            throw new Error('Image is too large and compression failed. Please try a smaller image.')
          }
        }
        
        console.log('🖼️ Setting profile image')
        setProfileImage(imageUrl)
        
        // Save to localStorage with consistent key
        const userKey = getProfileImageKey()
        console.log(`🖼️ Saving image with key: ${userKey}`)
        localStorage.setItem(userKey, imageUrl)
        
        // Also save with email key for backward compatibility
        if (user?.email) {
          const emailKey = `profile_image_${user.email}`
          console.log(`🖼️ Also saving with email key: ${emailKey}`)
          localStorage.setItem(emailKey, imageUrl)
        }
        
        // Call callback if provided
        if (onImageUpdate) {
          console.log('🖼️ Calling onImageUpdate callback')
          onImageUpdate(imageUrl)
        }

        setShowModal(false)
        console.log('🖼️ Image upload completed successfully')
      } catch (error) {
        console.error('🖼️ Error processing image:', error)
        console.error('🖼️ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
        setErrorMessage(`Error processing image: ${error.message}. Please try a different image or a smaller file.`)
        setShowErrorModal(true)
      }
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    
    // Remove from all possible keys
    const possibleKeys = getAllPossibleProfileImageKeys()
    possibleKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    if (onImageUpdate) {
      onImageUpdate(null)
    }
    setShowModal(false)
  }

  const openUploadModal = () => {
    setShowModal(true)
  }

  // Generate consistent user ID for profile image storage
  const getProfileImageKey = () => {
    const baseId = user?.id || user?.email || 'default'
    return `profile_image_${baseId}`
  }

  // Get all possible profile image keys for this user (in case of ID changes)
  const getAllPossibleProfileImageKeys = () => {
    const keys = []
    if (user?.id) keys.push(`profile_image_${user.id}`)
    if (user?.email) keys.push(`profile_image_${user.email}`)
    return keys
  }

  // Load saved profile image on component mount
  React.useEffect(() => {
    try {
      console.log('🖼️ ProfileAvatar useEffect triggered:', { user, userId: user?.id, userEmail: user?.email })
      
      if (!user) {
        console.log('🖼️ No user data, skipping image load')
        return
      }

    // Try to find existing profile image using multiple possible keys
    const possibleKeys = getAllPossibleProfileImageKeys()
    console.log('🖼️ Checking possible keys:', possibleKeys)
    
    let savedImage = null
    
    for (const key of possibleKeys) {
      const image = localStorage.getItem(key)
      console.log(`🖼️ Checking key "${key}":`, image ? 'FOUND' : 'NOT FOUND')
      if (image) {
        savedImage = image
        break
      }
    }
    
    if (savedImage) {
      console.log('🖼️ Found saved image, setting profile image')
      setProfileImage(savedImage)
      // If we found an image with a different key, migrate it to the current key
      const currentKey = getProfileImageKey()
      if (!localStorage.getItem(currentKey)) {
        console.log(`🖼️ Migrating image to current key: ${currentKey}`)
        localStorage.setItem(currentKey, savedImage)
      }
    } else {
      console.log('🖼️ No saved image found')
    }
    } catch (error) {
      console.error('🖼️ Error in ProfileAvatar useEffect:', error)
      // Don't crash the component, just log the error
    }
  }, [user?.id, user?.email, user])

  const getAvatarContent = () => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt={`${user?.name || 'User'} profile`}
          className={`${config.wrapper} rounded-full object-cover border-2 border-white/20`}
        />
      )
    }

    // Default gradient avatar with initials
    const gradientClass = user?.accountType === 'family' 
      ? 'bg-gradient-to-br from-blue-400 to-purple-500'
      : user?.accountType === 'admin'
      ? 'bg-gradient-to-br from-red-400 to-orange-500'
      : 'bg-gradient-to-br from-purple-400 to-blue-500'

    return (
      <div className={`${config.wrapper} ${gradientClass} rounded-full flex items-center justify-center text-white font-semibold ${config.text}`}>
        {user?.name?.charAt(0) || <User className={config.icon} />}
      </div>
    )
  }

  const getModalClass = () => {
    if (isLightMode) {
      return 'bg-white rounded-lg shadow-xl border border-gray-200'
    }
    return 'bg-gray-800 rounded-lg shadow-xl border border-gray-600'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-gray-400'
  }

  return (
    <>
      <div 
        className={`relative ${className}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {getAvatarContent()}
        
        {/* Upload overlay on hover */}
        {showUploadOnHover && isHovering && (
          <div 
            onClick={openUploadModal}
            className={`absolute inset-0 ${config.wrapper} rounded-full bg-black/50 flex items-center justify-center cursor-pointer transition-opacity`}
          >
            <Camera className={`${config.icon} text-white`} />
          </div>
        )}

        {/* Upload button for non-hoverable version */}
        {!showUploadOnHover && (
          <button
            onClick={openUploadModal}
            className={`absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors border-2 ${isLightMode ? 'border-white' : 'border-gray-800'}`}
          >
            <Camera className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Glass Upload Modal */}
      {showModal && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              className="glass-modal-container p-6 max-w-md w-full mx-auto"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                zIndex: 10000
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Profile Picture
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="mb-4 flex justify-center">
                  {getAvatarContent()}
                </div>
                <p className="text-gray-400 text-sm">
                  Upload a profile picture to personalize your account
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>User ID: {user?.id || 'undefined'}</p>
                  <p>User Email: {user?.email || 'undefined'}</p>
                  <p>Storage Key: {getProfileImageKey()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload New Picture</span>
                </button>

                {profileImage && (
                  <>
                    <button
                      onClick={() => {
                        console.log('🖼️ Manual save triggered')
                        try {
                          const userKey = getProfileImageKey()
                          console.log(`🖼️ Saving image with key: ${userKey}`)
                          localStorage.setItem(userKey, profileImage)
                          if (user?.email) {
                            const emailKey = `profile_image_${user.email}`
                            console.log(`🖼️ Also saving with email key: ${emailKey}`)
                            localStorage.setItem(emailKey, profileImage)
                          }
                          setErrorMessage('Profile picture saved!')
                          setShowErrorModal(true)
                        } catch (error) {
                          console.error('🖼️ Error saving image:', error)
                          if (error.name === 'QuotaExceededError') {
                            setErrorMessage('Image is too large for storage. Please try a smaller image.')
                          } else {
                            setErrorMessage('Error saving image. Please try again.')
                          }
                          setShowErrorModal(true)
                        }
                      }}
                      className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Save Picture</span>
                    </button>
                    
                    <button
                      onClick={handleRemoveImage}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove Picture</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Recommended: Square images (1:1 ratio)</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Error Modal */}
      {showErrorModal && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              className="glass-modal-container p-6 max-w-md w-full mx-auto"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span>Notice</span>
                </h3>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-white text-center">
                  {errorMessage}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>OK</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default ProfileAvatar
