# TALLA Reports System - Quick Setup Script
# Run this script from PowerShell in the main project directory

Write-Host "🚀 Setting up TALLA Reports System..." -ForegroundColor Green

# Install main project dependencies
Write-Host "📦 Installing main project dependencies..." -ForegroundColor Yellow
npm install

# Navigate to server directory and install dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Push-Location server
npm install
Pop-Location

# Create .env file if it doesn't exist
if (-not (Test-Path "server\.env")) {
    Write-Host "⚙️ Creating environment file..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "⚠️  Please edit server\.env and add your OpenAI API key!" -ForegroundColor Red
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit server\.env and add your OpenAI API key" -ForegroundColor White
Write-Host "2. Start the backend server: cd server && npm run dev" -ForegroundColor White
Write-Host "3. Start the frontend app: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The Reports system will be available at http://localhost:5173" -ForegroundColor Green