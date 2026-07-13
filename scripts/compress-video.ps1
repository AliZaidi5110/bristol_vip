# Compress the hero background video for web delivery.
#
# Requires ffmpeg on PATH. Install once with:
#   winget install Gyan.FFmpeg --source winget
#
# Usage (from project root):
#   npm run compress-video
#
# Input:  public/videos/IMG_8136.MP4  (~1.3 GB WhatsApp export)
# Output: public/videos/hero-compressed.mp4  (typically 8–20 MB)
#
# The site automatically uses hero-compressed.mp4 when this file exists.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "package.json"))) {
    $root = (Get-Location).Path
}

$input  = Join-Path $root "public\videos\IMG_8136.MP4"
$output = Join-Path $root "public\videos\hero-compressed.mp4"

if (-not (Test-Path $input)) {
    Write-Error "Source video not found: $input"
}

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
    Write-Host ""
    Write-Host "ffmpeg is not installed or not on PATH." -ForegroundColor Yellow
    Write-Host "Install it with:  winget install Gyan.FFmpeg --source winget" -ForegroundColor Yellow
    Write-Host "Then close and reopen your terminal and run:  npm run compress-video" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Compressing hero video (this may take a few minutes)..."
Write-Host "  Input:  $input"
Write-Host "  Output: $output"
Write-Host ""

# Web-optimised H.264: 1080p max, no audio, fast-start for streaming, CRF 28.
& ffmpeg -y -i $input `
    -an `
    -vf "scale='min(1920,iw)':-2" `
    -c:v libx264 `
    -crf 28 `
    -preset slow `
    -movflags +faststart `
    $output

if ($LASTEXITCODE -ne 0) {
    Write-Error "ffmpeg failed with exit code $LASTEXITCODE"
}

$inMb  = [math]::Round((Get-Item $input).Length / 1MB, 1)
$outMb = [math]::Round((Get-Item $output).Length / 1MB, 1)

Write-Host ""
Write-Host "Done! $inMb MB -> $outMb MB" -ForegroundColor Green
Write-Host "The site will now use hero-compressed.mp4 automatically."
