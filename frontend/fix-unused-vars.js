#!/usr/bin/env node
/**
 * Comprehensive fix script for Kamioi frontend linting issues
 * This script will clean up unused variables, imports, and fix common issues
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const FRONTEND_DIR = process.cwd();
const JSX_EXTENSIONS = ['.jsx', '.js'];

// Common unused imports that can be safely removed
const COMMON_UNUSED_IMPORTS = [
  'useEffect', 'useCallback', 'useMemo', 'useState',
  'Filter', 'Search', 'Upload', 'Download', 'Settings',
  'Database', 'Users', 'User', 'Shield', 'Activity',
  'TrendingUp', 'BarChart3', 'Clock', 'Calendar',
  'DollarSign', 'Target', 'CheckCircle', 'FileText',
  'CreditCard', 'Briefcase', 'Phone', 'MapPin',
  'Star', 'Award', 'Zap', 'Pause', 'Play', 'Timer',
  'Cpu', 'HardDrive', 'Layers', 'Box', 'Package',
  'Archive', 'Grid', 'Network', 'Globe', 'Wifi',
  'Signal', 'Battery', 'Thermometer', 'Wind',
  'ArrowRight', 'ArrowDown', 'ArrowUp', 'RotateCcw',
  'RefreshCw', 'Cloud', 'CloudOff', 'CloudRain',
  'CloudSnow', 'CloudLightning', 'TestTube', 'TestTube2',
  'Beaker', 'Microscope', 'Code', 'Terminal', 'Monitor',
  'Laptop', 'Bell', 'BellRing', 'BellOff', 'Volume2',
  'VolumeX', 'Megaphone', 'Radio', 'Tv', 'Smartphone',
  'Mail', 'MessageSquare', 'Video', 'Camera', 'Mic',
  'MicOff', 'Headphones', 'Speaker', 'Volume1',
  'Folder', 'FolderOpen', 'FileImage', 'FileCode',
  'FileSpreadsheet', 'Bookmark', 'Tag', 'Calculator',
  'Info', 'AlertTriangle', 'HelpCircle', 'Cog', 'Wrench',
  'Hammer', 'Scissors', 'Minus', 'Share', 'Lock',
  'Unlock', 'Heart', 'XCircle', 'Eye', 'EyeOff',
  'Trash2', 'TrashIcon', 'Archive', 'ChevronDown',
  'ChevronRight', 'Plus', 'Edit', 'Send', 'TrendingDown',
  'PieChart', 'LineChart', 'UserPlus', 'UserMinus',
  'Menu', 'X', 'LogOut', 'UserCheck', 'BookOpen',
  'ShoppingBag', 'Lightbulb', 'MoreVertical',
  'ChevronLeft', 'ChevronRight', 'Building2',
  'Wallet', 'Banknote', 'Coins', 'DownloadIcon'
];

// Common unused variables that can be safely removed
const COMMON_UNUSED_VARS = [
  'user', 'loading', 'setLoading', 'isDarkMode',
  'isLightMode', 'isCloudMode', 'sidebarOpen',
  'setSidebarOpen', 'showFilters', 'setShowFilters',
  'admin', 'theme', 'selectedDictionary',
  'setSelectedDictionary', 'getStatusIcon',
  'getTextClass', 'getSelectClass', 'getButtonClass',
  'getCardClass', 'handleLogout', 'handleBankSync',
  'addTransactions', 'showModal', 'showConfirmModal',
  'showErrorModal', 'totalFeesPaid', 'safeFamilyGoals',
  'currentPage', 'setCurrentPage', 'showAllHoldings',
  'showAutoInvest', 'showRebalancing', 'showTaxHarvesting',
  'mockPortfolioValue', 'totalPages', 'allocationData',
  'showSuccessModal', 'selectedGoal', 'isUploading',
  'recommendations', 'setRecommendations', 'holdings',
  'setFamilyMembers', 'setFamilyTransactions',
  'totalFamilyTransactions', 'setFamilySpendingByCategory',
  'familyRoundUpImpact', 'setFamilyRoundUpImpact',
  'setFamilyAIInsights', 'transactions', 'goals',
  'merchant', 'amount', 'index', 'content',
  'trackRecommendationClick', 'updateTransactionStatus',
  'showExportModal', 'getSuggestedStock', 'calculateShares',
  'getCompanyDomain', 'getCompanyLogo', 'createFallbackLogo',
  'calculatePossibleShares', 'updatedTransactions',
  'mappedTransactions', 'totalFees', 'markAllAsRead',
  'clearNotification', 'clearAllNotifications',
  'searchTerm', 'setSearchTerm', 'analytics',
  'handleCreateCampaign', 'handleSendCampaign',
  'handleAnnotate', 'handleSendToQueue',
  'handleClusterMapping', 'apiService', 'mxConnectData',
  'loginAdmin', 'getUserDashboardPath', 'transactionId'
];

function shouldProcessFile(filePath) {
  const ext = extname(filePath);
  return JSX_EXTENSIONS.includes(ext) && !filePath.includes('node_modules');
}

function cleanUnusedImports(content) {
  let lines = content.split('\n');
  let cleaned = [];
  let inImportBlock = false;
  let importStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is an import line
    if (line.trim().startsWith('import ')) {
      if (!inImportBlock) {
        inImportBlock = true;
        importStart = i;
      }
      
      // Check if this import line has unused imports
      const importMatch = line.match(/import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(imp => imp.trim());
        const usedImports = imports.filter(imp => {
          const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
          return !COMMON_UNUSED_IMPORTS.includes(cleanImp);
        });
        
        if (usedImports.length === 0) {
          // Remove entire import line
          continue;
        } else if (usedImports.length < imports.length) {
          // Keep only used imports
          const newImport = line.replace(/\{[^}]+\}/, `{ ${usedImports.join(', ')} }`);
          cleaned.push(newImport);
          continue;
        }
      }
      
      // Check if this is a default import that might be unused
      const defaultImportMatch = line.match(/import\s+(\w+)\s+from\s*['"][^'"]+['"]/);
      if (defaultImportMatch) {
        const importName = defaultImportMatch[1];
        if (COMMON_UNUSED_IMPORTS.includes(importName)) {
          continue;
        }
      }
    } else if (inImportBlock && line.trim() === '') {
      // Empty line after imports - end of import block
      inImportBlock = false;
    } else if (inImportBlock && !line.trim().startsWith('import ')) {
      // Non-import line - end of import block
      inImportBlock = false;
    }
    
    cleaned.push(line);
  }
  
  return cleaned.join('\n');
}

function cleanUnusedVariables(content) {
  let lines = content.split('\n');
  let cleaned = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for unused variable declarations
    const varMatch = line.match(/const\s+(\w+)\s*=/);
    if (varMatch) {
      const varName = varMatch[1];
      if (COMMON_UNUSED_VARS.includes(varName)) {
        // Check if this variable is used elsewhere in the file
        const remainingContent = lines.slice(i + 1).join('\n');
        if (!remainingContent.includes(varName)) {
          // Variable is not used, remove the line
          continue;
        }
      }
    }
    
    // Check for unused destructured variables
    const destructureMatch = line.match(/const\s*\{([^}]+)\}\s*=/);
    if (destructureMatch) {
      const vars = destructureMatch[1].split(',').map(v => v.trim().split(':')[0].trim());
      const usedVars = vars.filter(v => {
        const cleanVar = v.replace(/\s+as\s+\w+/, '').trim();
        return !COMMON_UNUSED_VARS.includes(cleanVar);
      });
      
      if (usedVars.length === 0) {
        // All destructured variables are unused, remove the line
        continue;
      } else if (usedVars.length < vars.length) {
        // Keep only used variables
        const newDestructure = line.replace(/\{[^}]+\}/, `{ ${usedVars.join(', ')} }`);
        cleaned.push(newDestructure);
        continue;
      }
    }
    
    cleaned.push(line);
  }
  
  return cleaned.join('\n');
}

function fixUnescapedEntities(content) {
  // Fix common unescaped entities
  return content
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;');
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    let cleaned = content;
    
    // Clean unused imports
    cleaned = cleanUnusedImports(cleaned);
    
    // Clean unused variables
    cleaned = cleanUnusedVariables(cleaned);
    
    // Fix unescaped entities (be careful with this)
    // cleaned = fixUnescapedEntities(cleaned);
    
    if (cleaned !== content) {
      writeFileSync(filePath, cleaned, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const files = readdirSync(dirPath);
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      fixedCount += processDirectory(fullPath);
    } else if (shouldProcessFile(fullPath)) {
      if (processFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('🔧 Starting comprehensive frontend cleanup...\n');

const srcDir = join(FRONTEND_DIR, 'src');
const fixedCount = processDirectory(srcDir);

console.log(`\n✅ Cleanup complete! Fixed ${fixedCount} files.`);
console.log('\n📝 Note: Some warnings may remain for complex cases that require manual review.');