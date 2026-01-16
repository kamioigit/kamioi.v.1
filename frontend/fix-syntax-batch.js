const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all JSX files that use isLightMode but don't import it
const srcDir = path.join(__dirname, 'src');
const files = [];

function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      findFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('isLightMode') && !content.includes('const { isLightMode }') && !content.includes('const { isLightMode,') && !content.includes('isLightMode:') && content.includes('useTheme')) {
        files.push(fullPath);
      }
    }
  }
}

findFiles(srcDir);

console.log(`Found ${files.length} files to fix`);

// Fix each file
let fixed = 0;
for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Check if useTheme is imported
    if (content.includes('useTheme') && !content.includes('const { isLightMode }')) {
      // Find the useTheme hook usage
      const useThemeMatch = content.match(/const\s*{\s*([^}]+)\s*}\s*=\s*useTheme\(\)/);
      if (useThemeMatch) {
        // Add isLightMode to existing destructuring
        const existing = useThemeMatch[1];
        if (!existing.includes('isLightMode')) {
          content = content.replace(
            useThemeMatch[0],
            `const { ${existing}, isLightMode } = useTheme()`
          );
        }
      } else if (content.includes('useTheme()')) {
        // Add new destructuring if useTheme is called but not destructured
        const lines = content.split('\n');
        let inserted = false;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('useTheme') && !inserted) {
            // Find the component function start
            for (let j = i; j >= 0; j--) {
              if (lines[j].match(/^const\s+\w+\s*=\s*\(/)) {
                // Insert after the opening brace
                const funcLine = lines[j];
                const match = funcLine.match(/^const\s+(\w+)\s*=\s*\(/);
                if (match) {
                  // Find where the function body starts
                  let braceCount = 0;
                  let foundStart = false;
                  for (let k = j + 1; k < lines.length && k < j + 10; k++) {
                    if (lines[k].includes('{')) {
                      foundStart = true;
                      // Insert after this line
                      if (!lines[k + 1] || !lines[k + 1].includes('const {') || !lines[k + 1].includes('isLightMode')) {
                        lines.splice(k + 1, 0, '  const { isLightMode } = useTheme()');
                        inserted = true;
                        break;
                      }
                    }
                  }
                }
                break;
              }
            }
            break;
          }
        }
        if (inserted) {
          content = lines.join('\n');
        }
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      fixed++;
      console.log(`Fixed: ${path.relative(srcDir, file)}`);
    }
  } catch (err) {
    console.error(`Error fixing ${file}:`, err.message);
  }
}

console.log(`\nFixed ${fixed} files`);

