# How to Revert Image Changes

If you don't like the placeholder images, here's how to revert:

## Quick Revert (Remove All Images)

### Option 1: Remove Image Sections
Search for `🖼️ PLACEHOLDER` in `HomePageNew.jsx` and remove those sections:

1. **Hero Image** (around line 520-530)
   - Remove the entire `<div className="mb-12 max-w-4xl mx-auto">` block

2. **Step Images** (around line 585-600)
   - Remove the `<div className="w-full h-48 mb-4 rounded-xl...">` block
   - Keep the icon div below it

3. **Value Proposition Backgrounds** (around line 617-625)
   - Remove the background image divs
   - Remove the `relative z-10` wrapper divs

4. **Testimonial Photos** (around line 708-720)
   - Change back to simple avatar div with initials

5. **Portfolio Screenshots** (around line 730-745)
   - Remove the portfolio screenshot div

6. **CTA Background** (around line 1053-1060)
   - Remove the background image div
   - Remove `relative z-10` from the content div

### Option 2: Git Revert (if using git)
```bash
cd C:\Users\beltr\Kamioi\frontend
git checkout HEAD -- src/pages/HomePageNew.jsx
```

## Specific Reverts

### Remove Only Hero Image
Delete lines ~520-530 (the hero image div)

### Remove Only Step Images  
Delete the image div inside each step card (keep the icon)

### Remove Only Testimonial Photos
Replace the img tag with just the avatar initials:
```jsx
<div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
  {testimonial.avatar}
</div>
```

## Notes
- All placeholder images use `onError` handlers that gracefully fall back
- Images are loaded with `loading="lazy"` for performance
- All images have proper alt text for accessibility


