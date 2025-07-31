# Configuration
$PROJECT_ID = "arcade-427302"
$BUCKET_NAME = "pepay-io"
$DOMAIN = "pepay.io"
$CERTIFICATE_NAME = "pepay-merchant-ssl"
$REGION = "europe-west1"
$IP_NAME = "pepay-merchant-ip"


# Function to print section headers
function Write-Header {
    param($text)
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

# Check if static IP exists
Write-Header "Checking static IP"
$ipExists = gcloud compute addresses list --filter="name=$IP_NAME" --format="get(name)"

if (!$ipExists) {
    Write-Host "Creating new static IP address"
    gcloud compute addresses create $IP_NAME `
        --project=$PROJECT_ID `
        --global `
        --ip-version=IPV4
    
    $IP_ADDRESS = gcloud compute addresses describe $IP_NAME --global --format="get(address)"
    Write-Host "Created static IP: $IP_ADDRESS"
} else {
    $IP_ADDRESS = gcloud compute addresses describe $IP_NAME --global --format="get(address)"
    Write-Host "Using existing static IP: $IP_ADDRESS"
}

# Check if bucket exists
Write-Header "Checking if bucket exists"
$bucketExists = gcloud storage buckets list --filter="name=$BUCKET_NAME" --format="get(name)"

if (!$bucketExists) {
    Write-Host "Creating new bucket: $BUCKET_NAME"
    gcloud storage buckets create gs://$BUCKET_NAME `
        --project=$PROJECT_ID `
        --location=$REGION `
        --uniform-bucket-level-access

    # Configure website settings
    Write-Host "Configuring bucket for website hosting"
    gcloud storage buckets update gs://$BUCKET_NAME `
        --web-main-page-suffix=index.html `
        --web-error-page=index.html `
        --default-storage-class=STANDARD

    # Make bucket publicly readable
    Write-Host "Setting public access"
    gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME `
        --member="allUsers" `
        --role="roles/storage.objectViewer"

    # Additional website configuration
    gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

    # Create CORS configuration file with UTF-8 encoding
    $corsConfig = @"
[
    {
        "origin": ["*"],
        "method": ["GET", "HEAD", "OPTIONS"],
        "responseHeader": [
            "Content-Type",
            "Access-Control-Allow-Origin",
            "Strict-Transport-Security",
            "X-Content-Type-Options",
            "X-Frame-Options"
        ],
        "maxAgeSeconds": 3600
    }
]
"@ 

    # Save CORS config with UTF-8 encoding
    $corsConfig | Out-File -FilePath "cors.json" -Encoding utf8

    # Apply CORS configuration
    gcloud storage buckets update gs://$BUCKET_NAME --cors-file=cors.json
    Remove-Item cors.json
} else {
    Write-Host "Bucket already exists: $BUCKET_NAME"
}

# Check and create SSL certificate if needed
Write-Header "Checking SSL certificate"
$certExists = gcloud compute ssl-certificates list --filter="name=$CERTIFICATE_NAME" --format="get(name)"

if (!$certExists) {
    Write-Host "Creating new managed SSL certificate"
    gcloud compute ssl-certificates create $CERTIFICATE_NAME `
        --domains="pepay.io" `
        --global
}

# Before building React application
Write-Header "Building React application"
$currentLocation = Get-Location

# Check if we're in the right directory structure
if (!(Test-Path "package.json")) {
    Write-Host "Error: Could not find package.json file" -ForegroundColor Red
    Write-Host "Current location: $currentLocation" -ForegroundColor Yellow
    Write-Host "Please run this script from the root of the project directory" -ForegroundColor Yellow
    exit 1
}

# We're already in the correct directory, no need to navigate

# Install pnpm if not already installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing pnpm globally..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Build steps
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pnpm install --frozen-lockfile

Write-Host "Building application..." -ForegroundColor Cyan
pnpm run build

# Return to original location
Set-Location $currentLocation

# Deploy to bucket
Write-Header "Deploying to Google Cloud Storage"
gsutil -m rsync -r dist gs://$BUCKET_NAME

# Set public access
Write-Header "Configuring public access"
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Configure load balancer
Write-Header "Configuring load balancer"

# Clean up existing resources if they exist
Write-Host "Checking and cleaning up existing load balancer components..."

# Function to safely delete a resource
function Remove-GCloudResource {
    param(
        [string]$Command,
        [string]$ResourceName
    )
    try {
        Write-Host "Deleting $ResourceName..."
        Invoke-Expression $Command
        Start-Sleep -Seconds 2  # Add delay after deletion
        return $true
    } catch {
        Write-Host "Error deleting $($ResourceName): $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

# Add this before the cleanup section (around line 140)
Write-Header "Checking existing configurations"

# Check all forwarding rules
Write-Host "Existing forwarding rules:" -ForegroundColor Yellow
gcloud compute forwarding-rules list --global --format="table(name,IPAddress,target)"

# Check all static IPs
Write-Host "`nExisting static IPs:" -ForegroundColor Yellow
gcloud compute addresses list --global --format="table(name,address,status)"

# Check DNS records
Write-Host "`nCurrent DNS resolution for domains:" -ForegroundColor Yellow
@("pepay.io", "pay.pepay.io", "docs.pepay.io") | ForEach-Object {
    Write-Host "`nChecking $_..."
    try {
        $result = Resolve-DnsName -Name $_ -Type A -ErrorAction Stop
        Write-Host "IP: $($result.IPAddress)"
    } catch {
        Write-Host "Not resolved"
    }
}

# Delete resources in correct order
if (gcloud compute forwarding-rules list --filter="name:pepay-merchant-https-forwarding-rule" --format="get(name)" --global) {
    Remove-GCloudResource -Command "gcloud compute forwarding-rules delete pepay-merchant-https-forwarding-rule --global --quiet" -ResourceName "forwarding rule"
}

if (gcloud compute target-https-proxies list --filter="name:pepay-merchant-https-proxy" --format="get(name)" --global) {
    Remove-GCloudResource -Command "gcloud compute target-https-proxies delete pepay-merchant-https-proxy --global --quiet" -ResourceName "HTTPS proxy"
}

if (gcloud compute url-maps list --filter="name:pepay-merchant-urlmap" --format="get(name)" --global) {
    Remove-GCloudResource -Command "gcloud compute url-maps delete pepay-merchant-urlmap --global --quiet" -ResourceName "URL map"
}

# Add extra verification for backend bucket
$backendBucketExists = $false
try {
    $backendBucketExists = [bool](gcloud compute backend-buckets describe pepay-merchant-backend --format="get(name)" 2>$null)
} catch {
    $backendBucketExists = $false
}

if ($backendBucketExists) {
    $deleted = Remove-GCloudResource -Command "gcloud compute backend-buckets delete pepay-merchant-backend --quiet" -ResourceName "backend bucket"
    if (!$deleted) {
        Write-Host "Failed to delete backend bucket. Stopping deployment." -ForegroundColor Red
        exit 1
    }
    # Add extra delay after backend bucket deletion
    Start-Sleep -Seconds 5
}

# Create new load balancer components
Write-Host "Creating new load balancer configuration..."
try {
    # Create backend bucket
    Write-Host "1. Creating backend bucket..."
    gcloud compute backend-buckets create pepay-merchant-backend `
    --gcs-bucket-name=$BUCKET_NAME `
    --enable-cdn `
    --cache-mode=CACHE_ALL_STATIC `
    --custom-response-header="Access-Control-Allow-Origin: *" `
    --custom-response-header="Strict-Transport-Security: max-age=31536000" `
    --custom-response-header="X-Content-Type-Options: nosniff" `
    --custom-response-header="X-Frame-Options: DENY"
    if ($LASTEXITCODE -ne 0) { throw "Failed to create backend bucket" }

    # Create URL map with HTTP to HTTPS redirect
    Write-Host "2. Creating URL map with HTTPS redirect..."
    $urlMapConfig = @{
        name = "pepay-merchant-urlmap"
        defaultService = "global/backendBuckets/pepay-merchant-backend"
        hostRules = @(
            @{
                hosts = @("pepay.io")
                pathMatcher = "path-matcher-1"
            }
        )
        pathMatchers = @(
            @{
                name = "path-matcher-1"
                defaultService = "global/backendBuckets/pepay-merchant-backend"
                pathRules = @(
                    @{
                        paths = @("/*", "/")
                        service = "global/backendBuckets/pepay-merchant-backend"
                    }
                )
            }
        )
    }

    # Convert to JSON and save to temporary file
    $urlMapConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "url-map.json" -Encoding utf8

    # Create URL map using the JSON file
    gcloud compute url-maps import pepay-merchant-urlmap `
        --global `
        --source="url-map.json"
    if ($LASTEXITCODE -ne 0) { throw "Failed to create URL map" }

    # Remove temporary file
    Remove-Item "url-map.json"

    # Create HTTPS proxy
    Write-Host "3. Creating HTTPS proxy..."
    gcloud compute target-https-proxies create pepay-merchant-https-proxy `
        --url-map=pepay-merchant-urlmap `
        --ssl-certificates=$CERTIFICATE_NAME `
        --global
    if ($LASTEXITCODE -ne 0) { throw "Failed to create HTTPS proxy" }

    # Create forwarding rule
    Write-Host "4. Creating forwarding rule..."
    gcloud compute forwarding-rules create pepay-merchant-https-forwarding-rule `
        --global `
        --target-https-proxy=pepay-merchant-https-proxy `
        --ports=443 `
        --address=$IP_NAME
    if ($LASTEXITCODE -ne 0) { throw "Failed to create forwarding rule" }

    Write-Host "Load balancer configuration completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Error during load balancer configuration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Verify load balancer components
Write-Host "`nVerifying load balancer components..." -ForegroundColor Yellow
$components = @(
    @{Name="Backend Bucket"; Cmd="gcloud compute backend-buckets describe pepay-merchant-backend"},
    @{Name="URL Map"; Cmd="gcloud compute url-maps describe pepay-merchant-urlmap --global"},
    @{Name="HTTPS Proxy"; Cmd="gcloud compute target-https-proxies describe pepay-merchant-https-proxy --global"},
    @{Name="Forwarding Rule"; Cmd="gcloud compute forwarding-rules describe pepay-merchant-https-forwarding-rule --global"}
)

foreach ($component in $components) {
    Write-Host "`nChecking $($component.Name)..." -ForegroundColor Cyan
    try {
        Invoke-Expression $component.Cmd
        Write-Host "$($component.Name) configured correctly" -ForegroundColor Green
    }
    catch {
        Write-Host "$($component.Name) configuration failed:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Header "Deployment Complete"
Write-Host "Website should be accessible at https://$DOMAIN"
Write-Host "Static IP Address: $IP_ADDRESS"
Write-Host "Please ensure your DNS A record for $DOMAIN points to $IP_ADDRESS"

# At the end of the script, after deployment completion:
Write-Header "DNS Configuration Information"
$IP_ADDRESS = gcloud compute addresses describe $IP_NAME --global --format="get(address)"

Write-Host "`nPlease configure your DNS with the following information:" -ForegroundColor Green
Write-Host "Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "IP Address: $IP_ADDRESS" -ForegroundColor Yellow
Write-Host "`nAdd this record to your DNS provider:"
Write-Host "Type: A" -ForegroundColor Cyan
Write-Host "Name: @" -ForegroundColor Cyan
Write-Host "Value: $IP_ADDRESS" -ForegroundColor Cyan
Write-Host "TTL: 300" -ForegroundColor Cyan

# Save IP to a file for reference
$IP_ADDRESS | Out-File -FilePath "payment-frame-ip.txt"
Write-Host "`nIP address has been saved to payment-frame-ip.txt"

# Add comprehensive configuration checks
Write-Header "Configuration Verification"

# Check bucket configuration
Write-Host "`nBucket Configuration:" -ForegroundColor Yellow
gcloud storage buckets describe gs://$BUCKET_NAME --format="table(name,location,website_config,cors_config)"

# Verify bucket contents
Write-Host "`nBucket Contents:" -ForegroundColor Yellow
gsutil ls -l gs://$BUCKET_NAME

# Check IAM permissions
Write-Host "`nBucket IAM Permissions:" -ForegroundColor Yellow
gcloud storage buckets get-iam-policy gs://$BUCKET_NAME

# Check load balancer components
Write-Host "`nLoad Balancer Configuration:" -ForegroundColor Yellow
Write-Host "1. Backend Bucket:" -ForegroundColor Cyan
gcloud compute backend-buckets describe pepay-merchant-backend --format="yaml"

Write-Host "`n2. URL Map:" -ForegroundColor Cyan
gcloud compute url-maps describe pepay-merchant-urlmap --global --format="yaml"

Write-Host "`n3. SSL Certificate:" -ForegroundColor Cyan
gcloud compute ssl-certificates describe $CERTIFICATE_NAME --global --format="yaml"

Write-Host "`n4. HTTPS Proxy:" -ForegroundColor Cyan
gcloud compute target-https-proxies describe pepay-merchant-https-proxy --global --format="yaml"

Write-Host "`n5. Forwarding Rules:" -ForegroundColor Cyan
gcloud compute forwarding-rules describe pepay-merchant-https-forwarding-rule --global --format="yaml"

# DNS Resolution Check
Write-Host "`nDNS Resolution Check:" -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name $DOMAIN -Type A -ErrorAction Stop
    Write-Host "DNS Resolution: Success" -ForegroundColor Green
    Write-Host "Resolved IP: $($dnsResult.IPAddress)"
    
    if ($dnsResult.IPAddress -ne $IP_ADDRESS) {
        Write-Host "WARNING: DNS IP does not match configured IP!" -ForegroundColor Red
        Write-Host "DNS IP: $($dnsResult.IPAddress)" -ForegroundColor Red
        Write-Host "Expected IP: $IP_ADDRESS" -ForegroundColor Red
    }
} catch {
    Write-Host "DNS Resolution: Failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Final Status Summary
Write-Header "Deployment Status Summary"
$status = @{
    "Bucket Exists" = [bool]$bucketExists
    "SSL Certificate" = [bool]$certExists
    "Backend Bucket" = [bool]$backendExists
    "DNS Resolution" = [bool]$dnsResult
    "Files Deployed" = Test-Path "dist"
}

foreach ($item in $status.GetEnumerator()) {
    $color = if ($item.Value) { "Green" } else { "Red" }
    Write-Host "$($item.Key): " -NoNewline
    Write-Host $item.Value -ForegroundColor $color
}