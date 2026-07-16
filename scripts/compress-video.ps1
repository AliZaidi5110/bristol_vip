# Compress the hero background video for web delivery.
#
# Prefers system ffmpeg; falls back to npm package ffmpeg-static.
#
# Usage (from project root):
#   npm run compress-video
#
# Input:  public/videos/IMG_8136.MP4  (local only, gitignored)
#         or public/videos/hero-compressed.mp4
# Output: public/videos/hero-web.mp4  (~4–8 MB, fast-start)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "package.json"))) {
    $root = (Get-Location).Path
}

$candidates = @(
    (Join-Path $root "public\videos\IMG_8136.MP4"),
    (Join-Path $root "public\videos\hero-compressed.mp4")
)
$input = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
$output = Join-Path $root "public\videos\hero-web.mp4"

if (-not $input) {
    Write-Error "No source video found. Place IMG_8136.MP4 or hero-compressed.mp4 in public/videos/"
}

$ffmpeg = $null
$cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($cmd) {
    $ffmpeg = $cmd.Source
} else {
    $static = Join-Path $root "node_modules\ffmpeg-static\ffmpeg.exe"
    if (Test-Path $static) { $ffmpeg = $static }
}

if (-not $ffmpeg) {
    Write-Host "ffmpeg not found. Installing ffmpeg-static…" -ForegroundColor Yellow
    Push-Location $root
    $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
    npm install --no-save ffmpeg-static
    Pop-Location
    $ffmpeg = Join-Path $root "node_modules\ffmpeg-static\ffmpeg.exe"
}

if (-not (Test-Path $ffmpeg)) {
    Write-Error "Could not locate ffmpeg."
}

Write-Host "Compressing hero video…"
Write-Host "  Input:  $input"
Write-Host "  Output: $output"
Write-Host ""

# ~35s loop, 960p, no audio, fast-start — aims for ~4–8 MB
& $ffmpeg -y -i $input `
    -t 35 `
    -an `
    -vf "scale=960:-2" `
    -c:v libx264 `
    -profile:v baseline `
    -level 3.0 `
    -pix_fmt yuv420p `
    -crf 32 `
    -preset medium `
    -movflags +faststart `
    -maxrate 1200k `
    -bufsize 2400k `
    $output

if ($LASTEXITCODE -ne 0) {
    Write-Error "ffmpeg failed with exit code $LASTEXITCODE"
}

$inMb  = [math]::Round((Get-Item $input).Length / 1MB, 1)
$outMb = [math]::Round((Get-Item $output).Length / 1MB, 1)

Write-Host ""
Write-Host "Done! $inMb MB -> $outMb MB" -ForegroundColor Green
Write-Host "Site uses /videos/hero-web.mp4 (see site.config.ts)."
