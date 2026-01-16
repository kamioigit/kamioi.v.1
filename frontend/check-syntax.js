#!/usr/bin/env node
/**
 * Custom syntax checker for Kamioi frontend
 * Ignores Flow/TypeScript files and other non-executable files
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const IGNORE_PATTERNS = [
  /\.flow\.js$/,
  /\.original\.js$/,
  /\.esm\./,
  /\.map$/,
  /\.d\.ts$/,
  /\.ts$/,
  /\.tsx$/,
  /test/,
  /tests/,
  /__tests__/,
  /\.test\.js$/,
  /\.spec\.js$/,
  /node_modules\/.*\/src\//,
  /node_modules\/.*\/dist\/.*\.esm\./
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function checkJavaScriptFiles(dir) {
  const files = readdirSync(dir);
  const errors = [];
  
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules subdirectories that contain problematic files
      if (file === 'node_modules') {
        continue;
      }
      errors.push(...checkJavaScriptFiles(fullPath));
    } else if (file.endsWith('.js') && !shouldIgnoreFile(fullPath)) {
      try {
        execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
        console.log(`✅ ${fullPath}`);
      } catch (error) {
        console.log(`❌ ${fullPath}`);
        errors.push({ file: fullPath, error: error.message });
      }
    }
  }
  
  return errors;
}

console.log('🔍 Checking JavaScript syntax in Kamioi frontend...\n');

const frontendDir = process.cwd();
const errors = checkJavaScriptFiles(frontendDir);

if (errors.length === 0) {
  console.log('\n✅ All JavaScript files passed syntax check!');
  process.exit(0);
} else {
  console.log(`\n❌ Found ${errors.length} syntax errors:`);
  errors.forEach(({ file, error }) => {
    console.log(`  ${file}: ${error}`);
  });
  process.exit(1);
}
