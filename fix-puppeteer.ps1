# =========================================
# fix-puppeteer.ps1
# This script will:
# 1. Clean up broken Puppeteer installs
# 2. Install puppeteer-core
# 3. Ensure you can use local Chrome
# =========================================

# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host "=== Puppeteer Fix Script ==="

# Step 1: Remove node_modules safely
Write-Host "Removing node_modules folder..."
if (Test-Path ".\node_modules") {
    Remove-Item -Recurse -Force ".\node_modules"
    Write-Host "node_modules removed."
} else {
    Write-Host "No node_modules folder found."
}

# Step 2: Remove package-lock.json if exists
Write-Host "Removing package-lock.json if it exists..."
if (Test-Path ".\package-lock.json") {
    Remove-Item -Force ".\package-lock.json"
    Write-Host "package-lock.json removed."
} else {
    Write-Host "No package-lock.json found."
}

# Step 3: Clear npm cache
Write-Host "Cleaning npm cache..."
npm cache clean --force
Write-Host "npm cache cleared."

# Step 4: Set environment variable to skip Puppeteer download
Write-Host "Setting PUPPETEER_SKIP_DOWNLOAD=1..."
$env:PUPPETEER_SKIP_DOWNLOAD = "1"

# Step 5: Install puppeteer-core, fs-extra, handlebars
Write-Host "Installing puppeteer-core, fs-extra, handlebars..."
npm install puppeteer-core fs-extra handlebars
Write-Host "Dependencies installed successfully."

# Step 6: Reminder to use local Chrome
Write-Host '✅ You can now run your project with puppeteer-core using your local Chrome.'
Write-Host '   Make sure to specify the Chrome executable path in your code:'
Write-Host '   const browser = await puppeteer.launch({ executablePath: "C:\Program Files\Google\Chrome\Application\chrome.exe", headless: true });'

Write-Host "=== Puppeteer Fix Completed ==="