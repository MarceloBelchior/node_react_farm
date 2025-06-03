#!/usr/bin/env node

/**
 * Debug Environment Setup Script
 * This script helps configure debug environment variables and setup
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_DEBUG_EXAMPLE = path.join(__dirname, '..', '.env.debug.example');

function setupDebugEnvironment() {
  console.log('🔧 Setting up debug environment...');

  // Check if .env file exists
  if (!fs.existsSync(ENV_FILE)) {
    console.log('⚠️  .env file not found. Creating from template...');

    // Create basic .env file
    const basicEnv = `# Brain Agriculture API Environment Variables
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/brain_agriculture
FRONTEND_URL=http://localhost:3000

# Debug Settings (uncomment to enable)
# DEBUG_HEADERS=true
# DEBUG_RESPONSE=true
# DEBUG_STACK=true
# MONGODB_DEBUG=true
# LOG_LEVEL=debug
`;

    fs.writeFileSync(ENV_FILE, basicEnv);
    console.log('✅ Created .env file with basic configuration');
  }

  // Read current .env content
  let envContent = fs.readFileSync(ENV_FILE, 'utf8');

  // Add debug variables if they don't exist
  const debugVars = [
    'DEBUG_HEADERS=false',
    'DEBUG_RESPONSE=false',
    'DEBUG_STACK=false',
    'MONGODB_DEBUG=false',
    'LOG_LEVEL=debug',
    'SLOW_QUERY_THRESHOLD=500',
    'SLOW_REQUEST_THRESHOLD=1000',
    'MEMORY_CHECK_INTERVAL=30000'
  ];

  let hasChanges = false;

  debugVars.forEach(debugVar => {
    const [key] = debugVar.split('=');

    if (!envContent.includes(key)) {
      envContent += `\n# ${debugVar}`;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(ENV_FILE, envContent);
    console.log('✅ Added debug variables to .env file (commented out)');
  }

  console.log('\n📋 Debug Environment Setup Complete!');
  console.log('\n🔧 To enable debugging:');
  console.log('1. Edit your .env file and uncomment debug variables');
  console.log('2. Restart your application');
  console.log('3. Use VS Code debug configurations or npm run debug');

  console.log('\n🚀 Available debug commands:');
  console.log('  npm run debug         - Start with debugger attached');
  console.log('  npm run debug:brk     - Start with breakpoint on first line');
  console.log('  npm run test:debug    - Debug Jest tests');

  console.log('\n📚 For complete guide, see: DEBUG_GUIDE.md');
}

function enableFullDebugging() {
  console.log('🔥 Enabling full debugging mode...');

  let envContent = fs.readFileSync(ENV_FILE, 'utf8');

  // Enable all debug options
  envContent = envContent
    .replace(/# DEBUG_HEADERS=.*/, 'DEBUG_HEADERS=true')
    .replace(/# DEBUG_RESPONSE=.*/, 'DEBUG_RESPONSE=true')
    .replace(/# DEBUG_STACK=.*/, 'DEBUG_STACK=true')
    .replace(/# MONGODB_DEBUG=.*/, 'MONGODB_DEBUG=true')
    .replace(/# LOG_LEVEL=.*/, 'LOG_LEVEL=verbose');

  fs.writeFileSync(ENV_FILE, envContent);
  console.log('✅ Full debugging enabled! Restart your application to see detailed logs.');
}

function disableDebugging() {
  console.log('🔇 Disabling debugging...');

  let envContent = fs.readFileSync(ENV_FILE, 'utf8');

  // Disable all debug options
  envContent = envContent
    .replace(/DEBUG_HEADERS=true/, '# DEBUG_HEADERS=false')
    .replace(/DEBUG_RESPONSE=true/, '# DEBUG_RESPONSE=false')
    .replace(/DEBUG_STACK=true/, '# DEBUG_STACK=false')
    .replace(/MONGODB_DEBUG=true/, '# MONGODB_DEBUG=false')
    .replace(/LOG_LEVEL=verbose/, '# LOG_LEVEL=log');

  fs.writeFileSync(ENV_FILE, envContent);
  console.log('✅ Debugging disabled! Application will use normal logging.');
}

function showStatus() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('❌ No .env file found. Run setup first.');
    return;
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf8');

  console.log('📊 Debug Configuration Status:');
  console.log('================================');

  const debugVars = [
    'DEBUG_HEADERS',
    'DEBUG_RESPONSE',
    'DEBUG_STACK',
    'MONGODB_DEBUG',
    'LOG_LEVEL'
  ];

  debugVars.forEach(varName => {
    const match = envContent.match(new RegExp(`^${varName}=(.*)$`, 'm'));
    const commentedMatch = envContent.match(new RegExp(`^# ${varName}=(.*)$`, 'm'));

    if (match) {
      console.log(`✅ ${varName}: ${match[1]} (enabled)`);
    } else if (commentedMatch) {
      console.log(`⚪ ${varName}: ${commentedMatch[1]} (disabled)`);
    } else {
      console.log(`❌ ${varName}: not configured`);
    }
  });
}

// CLI Interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupDebugEnvironment();
    break;
  case 'enable':
    enableFullDebugging();
    break;
  case 'disable':
    disableDebugging();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('🔧 Brain Agriculture Debug Setup');
    console.log('================================');
    console.log('Usage: node debug-setup.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  setup     - Initial debug environment setup');
    console.log('  enable    - Enable full debugging');
    console.log('  disable   - Disable debugging');
    console.log('  status    - Show current debug configuration');
    console.log('');
    console.log('Examples:');
    console.log('  node debug-setup.js setup');
    console.log('  node debug-setup.js enable');
    console.log('  node debug-setup.js status');
    break;
}
