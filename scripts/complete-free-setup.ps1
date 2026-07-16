# One-time free setup — no payment required.
# Run: powershell -ExecutionPolicy Bypass -File scripts/complete-free-setup.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

Write-Host ""
Write-Host "=== Bristol VIP — free admin save setup ===" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: GitHub token ---
Write-Host "STEP 1: GitHub token (free, no payment)" -ForegroundColor Yellow
Write-Host "Opening GitHub token page in your browser..."
Start-Process "https://github.com/settings/tokens/new?description=Bristol+VIP+admin&scopes=repo"

Write-Host ""
Write-Host "On GitHub:" -ForegroundColor White
Write-Host "  - Tick ONLY the 'repo' checkbox"
Write-Host "  - Click 'Generate token'"
Write-Host "  - Copy the token (starts with ghp_)"
Write-Host ""

$githubToken = Read-Host "Paste your GitHub token here"
if (-not $githubToken -or $githubToken.Length -lt 20) {
    Write-Host "Invalid token. Run this script again." -ForegroundColor Red
    exit 1
}

# Test GitHub token
Write-Host "Testing GitHub token..." -ForegroundColor Gray
$headers = @{
    Authorization = "Bearer $githubToken"
    Accept        = "application/vnd.github+json"
}
$test = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
Write-Host "GitHub OK — logged in as $($test.login)" -ForegroundColor Green

# --- Step 2: Vercel login ---
Write-Host ""
Write-Host "STEP 2: Vercel login" -ForegroundColor Yellow
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "A browser window will open — log in to Vercel and authorize."
    vercel login
}

vercel whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel login failed. Run: vercel login" -ForegroundColor Red
    exit 1
}

# --- Step 3: Link project ---
if (-not (Test-Path ".vercel\project.json")) {
    Write-Host ""
    Write-Host "Linking to Vercel project (choose bristol-vip)..." -ForegroundColor Yellow
    vercel link --yes
}

# --- Step 4: Add env vars ---
Write-Host ""
Write-Host "STEP 3: Adding environment variables to Vercel..." -ForegroundColor Yellow

$vars = @{
    GITHUB_TOKEN      = $githubToken
    SESSION_SECRET    = "9e5dedb6805221ec5cf188c9064b5d0f271b2a5e938a4d54f298f8d1c3bbfb6c41577cf5d7c7b007c86e1a678c995fc5"
    ADMIN_PASSWORD    = "BristolVIP2026!"
    TICKET_LINK       = "https://www.eventbrite.co.uk/"
}

$envs = @("production", "preview", "development")

foreach ($name in $vars.Keys) {
    $value = $vars[$name]
    foreach ($env in $envs) {
        Write-Host "  Setting $name ($env)..." -ForegroundColor Gray
        vercel env rm $name $env --yes 2>$null
        $value | vercel env add $name $env --force 2>$null
        if ($LASTEXITCODE -ne 0) {
            $value | vercel env add $name $env
        }
    }
}

# --- Step 5: Redeploy ---
Write-Host ""
Write-Host "STEP 4: Redeploying production..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Admin login:  /vip-manage-2026"
Write-Host "Password:     BristolVIP2026!"
Write-Host "Saving events should work now (via GitHub — free)."
Write-Host ""
