#!/usr/bin/env node

/**
 * Automated script to fix common syntax errors:
 * 1. Add missing isLightMode from useTheme
 * 2. Add missing icon imports from lucide-react
 * 3. Fix common undefined variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common icon mappings - icons that are commonly used but missing
const COMMON_ICONS = [
  'Star', 'Award', 'Zap', 'Target', 'TrendingUp', 'TrendingDown', 'Users', 
  'Settings', 'Filter', 'Calendar', 'Download', 'Upload', 'Eye', 'EyeOff',
  'ChevronRight', 'ChevronLeft', 'MoreVertical', 'PieChart', 'BarChart3',
  'LineChart', 'Shield', 'Mail', 'Phone', 'MapPin', 'CreditCard', 'Trash2',
  'Plus', 'Minus', 'User', 'UserPlus', 'Bell', 'FileText', 'HelpCircle',
  'BookOpen', 'Video', 'Search', 'CheckCircle', 'X', 'Info', 'Lock', 'Cloud'
];

// Find all JSX files
function findJSXFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
      files.push(...findJSXFiles(fullPath));
    } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Check if file uses isLightMode but doesn't import it
function needsIsLightMode(content) {
  const usesIsLightMode = /isLightMode/.test(content);
  const hasUseTheme = /useTheme/.test(content);
  const hasIsLightModeFromTheme = /const\s*{\s*[^}]*isLightMode[^}]*}\s*=\s*useTheme\(\)/.test(content);
  
  return usesIsLightMode && hasUseTheme && !hasIsLightModeFromTheme;
}

// Check which icons are used but not imported
function findMissingIcons(content, existingImports) {
  const missing = [];
  
  for (const icon of COMMON_ICONS) {
    // Check if icon is used in JSX
    const iconRegex = new RegExp(`<${icon}\\s|\\b${icon}\\b`, 'g');
    if (iconRegex.test(content) && !existingImports.includes(icon)) {
      missing.push(icon);
    }
  }
  
  return missing;
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. Fix isLightMode
  if (needsIsLightMode(content)) {
    // Find useTheme line
    const useThemeMatch = content.match(/(const\s*{\s*[^}]*}\s*=\s*useTheme\(\))/);
    if (useThemeMatch) {
      const oldLine = useThemeMatch[1];
      if (!oldLine.includes('isLightMode')) {
        const newLine = oldLine.replace(/(const\s*{\s*)([^}]*)(\s*}\s*=\s*useTheme\(\))/, 
          (match, p1, p2, p3) => {
            const vars = p2.split(',').map(v => v.trim()).filter(v => v);
            if (!vars.includes('isLightMode')) {
              vars.push('isLightMode');
            }
            return `${p1}${vars.join(', ')}${p3}`;
          });
        content = content.replace(oldLine, newLine);
        modified = true;
        console.log(`✅ Fixed isLightMode in ${path.basename(filePath)}`);
      }
    } else if (content.includes('useTheme')) {
      // Add useTheme import if missing
      const importMatch = content.match(/(import\s+.*useTheme.*from\s+['"][^'"]+['"])/);
      if (importMatch) {
        // Add after the import
        const afterImport = content.indexOf(importMatch[0]) + importMatch[0].length;
        const nextLine = content.indexOf('\n', afterImport);
        const themeVars = content.match(/const\s*{\s*([^}]+)\s*}\s*=\s*useTheme\(\)/);
        if (themeVars) {
          const vars = themeVars[1].split(',').map(v => v.trim());
          if (!vars.includes('isLightMode')) {
            vars.push('isLightMode');
            const newLine = `  const { ${vars.join(', ')} } = useTheme()\n`;
            // Find where to insert (after imports, before first function)
            const functionMatch = content.match(/(const|function)\s+\w+\s*[=(]/);
            if (functionMatch) {
              const insertAt = functionMatch.index;
              content = content.slice(0, insertAt) + newLine + content.slice(insertAt);
              modified = true;
              console.log(`✅ Added isLightMode in ${path.basename(filePath)}`);
            }
          }
        }
      }
    }
  }
  
  // 2. Fix missing icon imports
  const lucideImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
  if (lucideImportMatch) {
    const existingImports = lucideImportMatch[1].split(',').map(i => i.trim());
    const missingIcons = findMissingIcons(content, existingImports);
    
    if (missingIcons.length > 0) {
      const allImports = [...existingImports, ...missingIcons].filter((v, i, a) => a.indexOf(v) === i);
      const newImport = `import { ${allImports.join(', ')} } from 'lucide-react'`;
      content = content.replace(/import\s+{[^}]+}\s+from\s+['"]lucide-react['"]/, newImport);
      modified = true;
      console.log(`✅ Added icons [${missingIcons.join(', ')}] in ${path.basename(filePath)}`);
    }
  } else if (content.match(/<[A-Z][a-zA-Z]+\s|from\s+['"]lucide-react['"]/)) {
    // File uses icons but has no import - add import
    const missingIcons = findMissingIcons(content, []);
    if (missingIcons.length > 0) {
      // Find first import statement
      const firstImport = content.match(/^import\s+.*$/m);
      if (firstImport) {
        const insertPos = firstImport.index + firstImport[0].length;
        const newImport = `\nimport { ${missingIcons.join(', ')} } from 'lucide-react'`;
        content = content.slice(0, insertPos) + newImport + content.slice(insertPos);
        modified = true;
        console.log(`✅ Added lucide-react import with [${missingIcons.join(', ')}] in ${path.basename(filePath)}`);
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

// Main execution
console.log('🔧 Starting automated syntax fixes...\n');

const srcDir = path.join(__dirname, 'src');
const files = findJSXFiles(srcDir);

console.log(`Found ${files.length} files to check\n`);

let fixedCount = 0;
for (const file of files) {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎉 Done! Run npm run lint to check remaining errors.');

