# Configuration
$PROJECT_ID = "arcade-427302"
$BUCKET_NAME = "pepay-io"

# Function to print section headers
function Write-Header {
    param($text)
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

# Verify we're in the correct directory
Write-Header "Checking Project Directory"
if (!(Test-Path "package.json")) {
    Write-Host "Error: Could not find package.json file" -ForegroundColor Red
    Write-Host "Please run this script from the root of the project directory" -ForegroundColor Yellow
    exit 1
}

# Pull latest changes
Write-Header "Pulling Latest Changes"
git fetch
git status
Write-Host "`nMake sure you have the latest changes before continuing" -ForegroundColor Yellow
pause

# Clean existing build
Write-Header "Cleaning Build Directory"
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# Install dependencies and build
Write-Header "Building Application"
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pnpm install --frozen-lockfile

Write-Host "Building application with forced options..." -ForegroundColor Cyan
$env:SKIP_TYPECHECK = "true"
$env:TSC_COMPILE_ON_ERROR = "true"
$env:CI = "false"  # Prevents treating warnings as errors

# Try the main build command
$buildSuccess = $false
try {
    pnpm run build
    if ($LASTEXITCODE -eq 0) {
        $buildSuccess = $true
    }
} catch {
    $buildSuccess = $false
}

# If main build fails, try the fallback
if (-not $buildSuccess) {
    Write-Host "First build attempt failed, trying with direct Vite build..." -ForegroundColor Yellow
    try {
        pnpm vite build
    } catch {
        Write-Host "Build failed with both methods" -ForegroundColor Red
        exit 1
    }
}

# Verify build
if (!(Test-Path "dist")) {
    Write-Host "Build failed: dist directory not found" -ForegroundColor Red
    exit 1
}

# Deploy to bucket
Write-Header "Deploying to Google Cloud Storage"
Write-Host "Syncing new files to bucket..." -ForegroundColor Cyan
gsutil -m rsync -d -r dist gs://$BUCKET_NAME

# Verify deployment
Write-Header "Verifying Deployment"
Write-Host "`nBucket Contents:" -ForegroundColor Yellow
gsutil ls -l gs://$BUCKET_NAME

# Clear CDN cache
Write-Header "Updating CDN Cache"
gcloud compute backend-buckets update pepay-merchant-backend `
    --enable-cdn `
    --cache-mode=CACHE_ALL_STATIC

Write-Host "`nDeployment complete! Changes may take a few minutes to propagate through the CDN." -ForegroundColor Green