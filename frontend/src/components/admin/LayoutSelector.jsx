import React from 'react'
import { Image as ImageIcon, Layout, Grid, Columns, Square, Layers, Split, AlignLeft, AlignRight, AlignCenter } from 'lucide-react'

const LAYOUT_OPTIONS = [
  {
    id: 'image_left',
    name: 'Image Left',
    description: 'Image on left, content on right',
    icon: AlignLeft,
    preview: 'img|content'
  },
  {
    id: 'image_right',
    name: 'Image Right',
    description: 'Image on right, content on left',
    icon: AlignRight,
    preview: 'content|img'
  },
  {
    id: 'image_top',
    name: 'Image Top',
    description: 'Image above content',
    icon: Layout,
    preview: 'img\ncontent'
  },
  {
    id: 'image_bottom',
    name: 'Image Bottom',
    description: 'Content above image',
    icon: Layout,
    preview: 'content\nimg'
  },
  {
    id: 'image_background',
    name: 'Background Image',
    description: 'Full background with overlay',
    icon: Layers,
    preview: 'bg-img\ncontent'
  },
  {
    id: 'image_grid',
    name: 'Image Grid',
    description: 'Multiple images in grid',
    icon: Grid,
    preview: 'img|img\nimg|img'
  },
  {
    id: 'image_carousel',
    name: 'Image Carousel',
    description: 'Sliding image gallery',
    icon: Square,
    preview: 'img→img→img'
  },
  {
    id: 'image_split',
    name: 'Split Screen',
    description: '50/50 split layout',
    icon: Split,
    preview: 'img|content'
  },
  {
    id: 'image_overlay',
    name: 'Image Overlay',
    description: 'Text overlay on image',
    icon: AlignCenter,
    preview: 'img+text'
  },
  {
    id: 'image_mosaic',
    name: 'Image Mosaic',
    description: 'Asymmetric layout',
    icon: Columns,
    preview: 'img|img\ncontent'
  }
]

const LayoutSelector = ({ selectedLayout, onLayoutSelect, isLightMode = false }) => {
  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode 
    ? 'bg-white border-gray-300 hover:border-blue-500' 
    : 'bg-white/10 border-white/20 hover:border-blue-500/50'

  return (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
          Select Layout
        </label>
        <p className={`${getSubtextClass()} text-xs mb-4`}>
          Choose how images and content are arranged in this section
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {LAYOUT_OPTIONS.map((layout) => {
          const IconComponent = layout.icon
          const isSelected = selectedLayout === layout.id
          
          return (
            <button
              key={layout.id}
              onClick={() => onLayoutSelect(layout.id)}
              className={`
                ${getCardClass()} border-2 rounded-lg p-4 transition-all cursor-pointer
                ${isSelected ? 'border-blue-500 bg-blue-500/20' : ''}
              `}
              title={layout.description}
            >
              <div className="space-y-2">
                <div className={`flex justify-center ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${isSelected ? getTextColor() : getSubtextClass()}`}>
                    {layout.name}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedLayout && (
        <div className={`mt-4 p-3 rounded-lg ${isLightMode ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'}`}>
          <p className={`text-sm ${isLightMode ? 'text-blue-800' : 'text-blue-300'}`}>
            <strong>Selected:</strong> {LAYOUT_OPTIONS.find(l => l.id === selectedLayout)?.name}
          </p>
          <p className={`text-xs mt-1 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>
            {LAYOUT_OPTIONS.find(l => l.id === selectedLayout)?.description}
          </p>
        </div>
      )}
    </div>
  )
}

export default LayoutSelector
export { LAYOUT_OPTIONS }


