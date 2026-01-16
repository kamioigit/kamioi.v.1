# Frontend Content Tab Implementation Plan

## Overview
This plan outlines the implementation of the `renderFrontendContentTab` function to replace the current stub that displays "Frontend Content Tab - Temporarily disabled". The implementation will allow admins to manage frontend content sections for different pages (homepage, features, how-it-works, learn, pricing).

## Current State Analysis

### Existing Infrastructure
- ✅ State management: `frontendContent`, `currentFrontendContent`, `pageTab` already exist
- ✅ API endpoints: `/api/admin/content/frontend` and `/api/admin/content/frontend/current` are being called
- ✅ Tab navigation: Frontend Content tab is already in the UI (line 1089)
- ✅ Theme support: `getTextColor()`, `getSubtextClass()`, `getCardClass()` helper functions available
- ✅ Editing infrastructure: `renderContentEditor()` exists for modal editing
- ✅ Save handler: `handleSaveContent()` exists (may need extension for frontend content)

### What Needs to Be Built
- ❌ `renderFrontendContentTab()` function implementation
- ❌ Section management UI (list, edit, add, delete sections)
- ❌ Page tab selector (homepage, features, how-it-works, learn, pricing)
- ❌ Section editor integration
- ❌ Save/update functionality for frontend content

## Data Structure Design

### Frontend Content Section Structure
```javascript
{
  id: string,
  page: 'homepage' | 'features' | 'how-it-works' | 'learn' | 'pricing',
  sectionKey: string, // e.g., 'hero_section', 'features_list', 'testimonials'
  sectionType: 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'stats' | 'content',
  title: string,
  content: object, // Flexible structure based on sectionType
  order: number,
  isActive: boolean,
  lastModified: string,
  metadata: {
    seoKeywords?: string,
    customClasses?: string,
    displayConditions?: object
  }
}
```

### Page-Specific Section Definitions
```javascript
const PAGE_SECTIONS = {
  homepage: [
    { key: 'hero_section', name: 'Hero Section', type: 'hero' },
    { key: 'features_overview', name: 'Features Overview', type: 'features' },
    { key: 'how_it_works', name: 'How It Works', type: 'content' },
    { key: 'testimonials', name: 'Testimonials', type: 'testimonials' },
    { key: 'pricing_preview', name: 'Pricing Preview', type: 'pricing' },
    { key: 'cta_section', name: 'Call to Action', type: 'cta' }
  ],
  features: [
    { key: 'features_hero', name: 'Features Hero', type: 'hero' },
    { key: 'features_list', name: 'Features List', type: 'features' },
    { key: 'features_comparison', name: 'Features Comparison', type: 'content' }
  ],
  'how-it-works': [
    { key: 'how_it_works_hero', name: 'How It Works Hero', type: 'hero' },
    { key: 'how_it_works_steps', name: 'Steps', type: 'content' },
    { key: 'how_it_works_demo', name: 'Demo Section', type: 'content' }
  ],
  learn: [
    { key: 'learn_hero', name: 'Learn Hero', type: 'hero' },
    { key: 'blog_posts_grid', name: 'Blog Posts', type: 'content' },
    { key: 'resources_list', name: 'Resources', type: 'content' }
  ],
  pricing: [
    { key: 'pricing_hero', name: 'Pricing Hero', type: 'hero' },
    { key: 'pricing_plans', name: 'Pricing Plans', type: 'pricing' },
    { key: 'pricing_faq', name: 'Pricing FAQ', type: 'faq' },
    { key: 'pricing_cta', name: 'Pricing CTA', type: 'cta' }
  ]
}
```

## Implementation Steps

### Phase 1: Basic Structure & Page Tabs
**Goal**: Create the basic UI structure with page tab navigation

1. **Create page tab selector**
   - Use existing `pageTab` state (already defined at line 13)
   - Create horizontal tab buttons for: Homepage, Features, How It Works, Learn, Pricing
   - Style consistently with existing tab design
   - Update `pageTab` state on click

2. **Create main container**
   - Use `getCardClass()` for consistent styling
   - Add header with page title and section count
   - Add "Add Section" button (similar to "New Page" in `renderPagesTab`)

3. **Display sections list**
   - Filter `frontendContent` by current `pageTab`
   - Show section cards in a grid (2 columns on desktop, 1 on mobile)
   - Each card shows: section name, type, status (active/inactive), last modified

### Phase 2: Section Management UI
**Goal**: Build the section list and basic actions

1. **Section card component**
   - Display section title, type badge, status indicator
   - Show last modified date
   - Action buttons: Edit, Delete, Toggle Active
   - Drag handle for reordering (optional, Phase 3)

2. **Section type badges**
   - Color-coded badges: Hero (blue), Features (green), Testimonials (purple), etc.
   - Use existing badge pattern from Pages tab

3. **Empty state**
   - Show message when no sections exist for selected page
   - Include "Add First Section" button

### Phase 3: Section Editor Integration
**Goal**: Connect section editing to existing editor modal

1. **Edit button handler**
   - Set `editingSection` state with section data
   - Open `renderContentEditor()` modal
   - Pass section-specific data structure

2. **Extend `renderContentEditor()`**
   - Check if `editingSection` exists and has `sectionType`
   - Render appropriate editor fields based on section type
   - For hero sections: headline, subheadline, CTA button, image
   - For features: feature list with icons, titles, descriptions
   - For testimonials: testimonial cards with name, role, content, rating
   - For pricing: pricing plan structure
   - For FAQ: question/answer pairs
   - For content: rich text editor

3. **Save handler extension**
   - Extend `handleSaveContent()` or create `handleSaveFrontendSection()`
   - Validate section data based on type
   - Call API: `PUT /api/admin/content/frontend/{sectionId}` or `POST /api/admin/content/frontend`
   - Update local state after successful save

### Phase 4: Add/Delete Functionality
**Goal**: Complete CRUD operations

1. **Add new section**
   - Create "Add Section" button handler
   - Show modal/dropdown to select section type
   - Create new section object with defaults
   - Set `editingSection` and open editor

2. **Delete section**
   - Add delete confirmation modal (use existing `showDeleteModal` pattern)
   - Call API: `DELETE /api/admin/content/frontend/{sectionId}`
   - Update local state after successful deletion

3. **Toggle active/inactive**
   - Quick toggle button on section card
   - Call API: `PATCH /api/admin/content/frontend/{sectionId}/toggle`
   - Update local state immediately

### Phase 5: Advanced Features (Optional)
**Goal**: Enhance UX with additional features

1. **Section reordering**
   - Implement drag-and-drop using `react-beautiful-dnd` or similar
   - Update `order` field on all affected sections
   - Batch API call to update order

2. **Section preview**
   - Add "Preview" button to see section as it appears on frontend
   - Open preview modal with rendered section

3. **Bulk operations**
   - Select multiple sections
   - Bulk activate/deactivate
   - Bulk delete

4. **Section templates**
   - Pre-defined section templates for common patterns
   - One-click section creation from template

## Code Structure

### Function Signature
```javascript
const renderFrontendContentTab = () => {
  // Get sections for current page
  const currentSections = frontendContent.filter(
    section => section.page === pageTab
  ) || []

  // Get available section definitions for current page
  const availableSections = PAGE_SECTIONS[pageTab] || []

  return (
    <div className="space-y-6">
      {/* Page Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-6">
        {['homepage', 'features', 'how-it-works', 'learn', 'pricing'].map(tab => (
          <button
            key={tab}
            onClick={() => setPageTab(tab)}
            className={`px-4 py-2 rounded-md transition-all ${
              pageTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-xl font-semibold ${getTextColor()}`}>
            Frontend Content Sections
          </h3>
          <p className={`${getSubtextClass()} text-sm mt-1`}>
            Edit {pageTab} content that appears on the public website ({currentSections.length} section{currentSections.length !== 1 ? 's' : ''})
          </p>
        </div>
        <button
          onClick={() => {
            // Open section type selector
            setEditingSection({ page: pageTab, sectionType: null, isNew: true })
            setIsEditing(true)
          }}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Sections Grid */}
      {currentSections.length === 0 ? (
        <div className={getCardClass()}>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className={`text-lg font-semibold ${getTextColor()} mb-2`}>
              No sections yet
            </h4>
            <p className={`${getSubtextClass()} mb-4`}>
              Get started by adding your first section for the {pageTab} page.
            </p>
            <button
              onClick={() => {
                setEditingSection({ page: pageTab, sectionType: null, isNew: true })
                setIsEditing(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add First Section
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSections
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section) => (
              <div key={section.id} className={getCardClass()}>
                {/* Section Card Content */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className={`text-lg font-semibold ${getTextColor()}`}>
                      {section.title || section.sectionKey}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        section.sectionType === 'hero' ? 'bg-blue-500/20 text-blue-400' :
                        section.sectionType === 'features' ? 'bg-green-500/20 text-green-400' :
                        section.sectionType === 'testimonials' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {section.sectionType}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        section.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className={`${getSubtextClass()} text-sm mb-4`}>
                  Last modified: {section.lastModified ? new Date(section.lastModified).toLocaleDateString() : 'Never'}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSection(section)
                      setIsEditing(true)
                    }}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 flex items-center justify-center space-x-2 transition-all text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      // Toggle active/inactive
                      handleToggleSection(section.id, !section.isActive)
                    }}
                    className={`flex-1 border rounded-lg px-3 py-2 flex items-center justify-center space-x-2 transition-all text-sm ${
                      section.isActive
                        ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-400'
                        : 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{section.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setContentToDelete(section)
                      setShowDeleteModal(true)
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 flex items-center justify-center transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
```

## Required Helper Functions

### 1. `handleToggleSection(sectionId, isActive)`
```javascript
const handleToggleSection = async (sectionId, isActive) => {
  try {
    const adminToken = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
    
    const response = await fetch(`${apiBaseUrl}/api/admin/content/frontend/${sectionId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isActive })
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        // Update local state
        setFrontendContent(prev => prev.map(section =>
          section.id === sectionId ? { ...section, isActive } : section
        ))
      }
    }
  } catch (error) {
    console.error('Error toggling section:', error)
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message: 'Failed to update section status'
    })
  }
}
```

### 2. `handleDeleteFrontendSection(sectionId)`
```javascript
const handleDeleteFrontendSection = async (sectionId) => {
  try {
    const adminToken = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
    
    const response = await fetch(`${apiBaseUrl}/api/admin/content/frontend/${sectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        // Update local state
        setFrontendContent(prev => prev.filter(section => section.id !== sectionId))
        setShowDeleteModal(false)
        setContentToDelete(null)
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Section deleted successfully'
        })
      }
    }
  } catch (error) {
    console.error('Error deleting section:', error)
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message: 'Failed to delete section'
    })
  }
}
```

### 3. `handleSaveFrontendSection(sectionData)`
```javascript
const handleSaveFrontendSection = async (sectionData) => {
  try {
    const adminToken = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
    
    const isNew = !sectionData.id
    const url = isNew
      ? `${apiBaseUrl}/api/admin/content/frontend`
      : `${apiBaseUrl}/api/admin/content/frontend/${sectionData.id}`
    
    const response = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...sectionData,
        lastModified: new Date().toISOString()
      })
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        // Update local state
        if (isNew) {
          setFrontendContent(prev => [...prev, result.data])
        } else {
          setFrontendContent(prev => prev.map(section =>
            section.id === sectionData.id ? result.data : section
          ))
        }
        setIsEditing(false)
        setEditingSection(null)
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: `Section ${isNew ? 'created' : 'updated'} successfully`
        })
      }
    }
  } catch (error) {
    console.error('Error saving section:', error)
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message: 'Failed to save section'
    })
  }
}
```

## Integration Points

### 1. Extend `renderContentEditor()` Modal
- Check if `editingSection` exists
- Render section-specific form fields based on `sectionType`
- Call `handleSaveFrontendSection()` on save

### 2. Update Delete Modal Handler
- Check if `contentToDelete` has `sectionKey` or `sectionType` (frontend section)
- Call `handleDeleteFrontendSection()` instead of `handleDeleteContent()`

### 3. Tab Rendering (Already Done)
- Line 1089: `{activeTab === 'frontend' && renderFrontendContentTab()}`
- No changes needed

## Error Prevention Checklist

✅ **Syntax Errors**
- All JSX properly closed
- All function braces balanced
- No orphaned code blocks
- Proper arrow function syntax

✅ **State Management**
- Use existing state variables
- Don't create duplicate state
- Proper state updates (immutable)

✅ **API Integration**
- Consistent error handling
- Loading states
- Success/error modals

✅ **Type Safety**
- Validate section data before API calls
- Handle missing/null data gracefully
- Default values for optional fields

✅ **Component Structure**
- Follow existing patterns (`renderPagesTab`, `renderBlogsTab`)
- Use existing helper functions (`getTextColor`, `getCardClass`)
- Consistent styling with rest of component

## Testing Plan

1. **Unit Testing**
   - Test section filtering by page
   - Test section sorting by order
   - Test state updates

2. **Integration Testing**
   - Test API calls (mock responses)
   - Test modal interactions
   - Test tab switching

3. **UI Testing**
   - Verify responsive design
   - Check theme compatibility (light/dark/cloud)
   - Verify all buttons work
   - Check empty states

4. **Error Scenarios**
   - Network failures
   - Invalid API responses
   - Missing data
   - Concurrent edits

## Implementation Order

1. **Start with Phase 1** - Basic structure and page tabs
2. **Then Phase 2** - Section cards and display
3. **Then Phase 3** - Editor integration
4. **Then Phase 4** - Add/delete functionality
5. **Finally Phase 5** - Advanced features (if needed)

## Notes

- Keep the implementation simple initially - can add advanced features later
- Follow existing code patterns closely to maintain consistency
- Test incrementally after each phase
- Ensure all syntax is correct before moving to next phase
- Use existing modal and error handling patterns

