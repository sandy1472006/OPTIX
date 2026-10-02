# ==============================================================================
# OPTIX — Local Bench Simulator Server Launcher
# Team AEROS | Smart India Hackathon 2026 | Problem Statement 26233
# ==============================================================================

$port = 8080
$url = "http://localhost:$port"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  OPTIX : Adaptive Hyperspectral Inspection System" -ForegroundColor Green
Write-Host "  Inline Microbial Contamination Screening & Smart Sorting Bench" -ForegroundColor Yellow
Write-Host "  SIH 2026 | Problem Statement ID: 26233 | Team AEROS (ID: 186870)" -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if port is in use
$tcpConn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcpConn) {
    Write-Host "[INFO] Port $port is already active. Opening browser..." -ForegroundColor Yellow
    Start-Process $url
    exit
}

Write-Host "[1/2] Launching browser at $url ..." -ForegroundColor Cyan
Start-Process $url

Write-Host "[2/2] Starting local HTTP server on port $port..." -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate the simulator server." -ForegroundColor Gray
Write-Host ""

try {
    python -m http.server $port
} catch {
    Write-Host "[ERROR] Python HTTP server failed to start: $_" -ForegroundColor Red
}
