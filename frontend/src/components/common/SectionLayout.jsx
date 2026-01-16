import React from 'react'

/**
 * SectionLayout - Renders a section with images and content based on layout configuration
 * 
 * @param {Object} props
 * @param {string} props.layoutType - Layout type (image_left, image_right, etc.)
 * @param {Array} props.images - Array of image objects with url, alt_text, caption
 * @param {Object} props.layoutConfig - Layout configuration (image_width, spacing, etc.)
 * @param {ReactNode} props.children - Content to render
 * @param {string} props.className - Additional CSS classes
 */
const SectionLayout = ({ 
  layoutType, 
  images = [], 
  layoutConfig = {},
  children,
  className = ''
}) => {
  // Debug logging
  if (layoutType) {
    console.log('[SectionLayout] Rendering with layout:', {
      layoutType,
      imagesCount: images?.length || 0,
      hasLayoutConfig: !!layoutConfig
    })
  }
  
  // If no layout type specified, render content only
  if (!layoutType) {
    return <div className={className}>{children}</div>
  }
  
  // Some layouts require images, others don't
  // Allow layouts to render even without images (user might add images later)
  // But log a warning if images are expected
  const layoutsRequiringImages = ['image_left', 'image_right', 'image_top', 'image_bottom', 'image_background', 'image_grid', 'image_carousel', 'image_split', 'image_overlay', 'image_mosaic']
  if (layoutsRequiringImages.includes(layoutType) && (!images || images.length === 0)) {
    console.warn(`[SectionLayout] Layout "${layoutType}" selected but no images provided. Layout will render without images.`)
  }

  const {
    image_width = '40%',
    content_order = 'image_first',
    spacing = '2rem',
    image_alignment = 'left'
  } = layoutConfig

  const imageStyle = {
    width: image_width,
    objectFit: 'cover'
  }

  const containerStyle = {
    gap: spacing
  }

  // Render images
  const renderImages = () => {
    if (images.length === 0) return null

    switch (layoutType) {
      case 'image_grid':
        return (
          <div className="grid grid-cols-2 gap-4">
            {images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt_text || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )

      case 'image_carousel':
        return (
          <div className="relative overflow-hidden rounded-lg">
            <div className="flex transition-transform duration-500">
              {images.map((image, index) => (
                <div key={index} className="min-w-full aspect-video">
                  <img
                    src={image.url}
                    alt={image.alt_text || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-3">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'image_background':
        return (
          <div 
            className="relative min-h-[400px] rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${images[0]?.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 p-8 text-white">
              {children}
            </div>
          </div>
        )

      case 'image_overlay':
        return (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={images[0]?.url}
              alt={images[0]?.alt_text || 'Background'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-8">
              <div className="text-white text-center">
                {children}
              </div>
            </div>
          </div>
        )

      case 'image_mosaic':
        return (
          <div className="grid grid-cols-2 gap-2">
            {images.slice(0, 3).map((image, index) => (
              <div 
                key={index} 
                className={`relative rounded-lg overflow-hidden ${
                  index === 0 ? 'col-span-2 aspect-video' : 'aspect-square'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt_text || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )

      default:
        // Single image layouts
        return (
          <div className="flex-shrink-0" style={imageStyle}>
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={images[0]?.url}
                alt={images[0]?.alt_text || 'Section image'}
                className="w-full h-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              {images[0]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
                  {images[0].caption}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  // Render based on layout type
  switch (layoutType) {
    case 'image_left':
      return (
        <div className={`flex flex-col md:flex-row items-start ${className}`} style={containerStyle}>
          {content_order === 'image_first' ? (
            <>
              {images && images.length > 0 && renderImages()}
              <div className="flex-1">{children}</div>
            </>
          ) : (
            <>
              <div className="flex-1">{children}</div>
              {images && images.length > 0 && renderImages()}
            </>
          )}
        </div>
      )

    case 'image_right':
      return (
        <div className={`flex flex-col md:flex-row items-start ${className}`} style={containerStyle}>
          {content_order === 'image_first' ? (
            <>
              {images && images.length > 0 && renderImages()}
              <div className="flex-1">{children}</div>
            </>
          ) : (
            <>
              <div className="flex-1">{children}</div>
              {images && images.length > 0 && renderImages()}
            </>
          )}
        </div>
      )

    case 'image_top':
      return (
        <div className={`flex flex-col ${className}`} style={containerStyle}>
          {images && images.length > 0 && renderImages()}
          <div>{children}</div>
        </div>
      )

    case 'image_bottom':
      return (
        <div className={`flex flex-col ${className}`} style={containerStyle}>
          <div>{children}</div>
          {images && images.length > 0 && renderImages()}
        </div>
      )

    case 'image_background':
    case 'image_overlay':
      // These layouts require images, so if no images, just render content
      if (!images || images.length === 0) {
        return <div className={className}>{children}</div>
      }
      return renderImages()

    case 'image_split':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${className}`}>
          <div className="relative aspect-video md:aspect-auto bg-white/5">
            {images && images[0] ? (
              <img
                src={images[0].url}
                alt={images[0].alt_text || 'Split image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40">
                <span>Image placeholder</span>
              </div>
            )}
          </div>
          <div className="p-8 flex items-center">
            {children}
          </div>
        </div>
      )

    case 'image_grid':
    case 'image_mosaic':
      return (
        <div className={className}>
          {images && images.length > 0 && renderImages()}
          <div className={images && images.length > 0 ? "mt-6" : ""}>{children}</div>
        </div>
      )

    case 'image_carousel':
      return (
        <div className={className}>
          {images && images.length > 0 && renderImages()}
          <div className={images && images.length > 0 ? "mt-6" : ""}>{children}</div>
        </div>
      )

    default:
      // Fallback: render content only
      return <div className={className}>{children}</div>
  }
}

export default SectionLayout

