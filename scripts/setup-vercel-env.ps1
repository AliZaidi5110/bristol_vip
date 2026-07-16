# Adds Bristol VIP env vars to the linked Vercel project.
# Run once after:  vercel login
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/setup-vercel-env.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "Checking Vercel login..." -ForegroundColor Cyan
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Run:  vercel login" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".vercel\project.json")) {
    Write-Host "Linking project to Vercel (pick bristol-vip / bristol_vip)..." -ForegroundColor Cyan
    vercel link --yes
}

$vars = @{
    SESSION_SECRET         = "9e5dedb6805221ec5cf188c9064b5d0f271b2a5e938a4d54f298f8d1c3bbfb6c41577cf5d7c7b007c86e1a678c995fc5"
    ADMIN_PASSWORD         = "BristolVIP2026!"
    TICKET_LINK            = "https://www.eventbrite.co.uk/"
    CONTACT_TO_EMAIL       = "bristolvip1@gmail.com"
    CONTACT_FROM_EMAIL     = "Bristol VIP Website <onboarding@resend.dev>"
    NEXT_PUBLIC_SITE_URL   = "https://bristol-vip-pi.vercel.app"
}

# Optional: set before running, e.g.
#   $env:RESEND_API_KEY = "re_xxxx"
#   powershell -ExecutionPolicy Bypass -File scripts/setup-vercel-env.ps1
if ($env:RESEND_API_KEY -and $env:RESEND_API_KEY.Trim().Length -gt 0) {
    $vars["RESEND_API_KEY"] = $env:RESEND_API_KEY.Trim()
    Write-Host "Including RESEND_API_KEY from environment." -ForegroundColor Green
} else {
    Write-Host "RESEND_API_KEY not in env — add it manually in Vercel after creating a key at resend.com" -ForegroundColor Yellow
}

$envs = @("production", "preview", "development")

foreach ($name in $vars.Keys) {
    $value = $vars[$name]
    foreach ($env in $envs) {
        Write-Host "Setting $name ($env)..." -ForegroundColor Gray
        $value | vercel env add $name $env --force 2>$null
        if ($LASTEXITCODE -ne 0) {
            # env may already exist — update via remove + add
            vercel env rm $name $env --yes 2>$null
            $value | vercel env add $name $env
        }
    }
}

Write-Host ""
Write-Host "Done. Redeploying production..." -ForegroundColor Green
vercel --prod --yes

Write-Host ""
Write-Host "Admin login:  /vip-manage-2026" -ForegroundColor Green
Write-Host "Password:     BristolVIP2026!" -ForegroundColor Green
