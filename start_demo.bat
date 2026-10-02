@echo off
echo ========================================================
echo   TRINETRA-X / OPTIX DEMO WEBSITE
echo   Inline Multimodal Hyperspectral Food Inspection
echo ========================================================
echo.
echo Launching demo in default browser...
start http://localhost:8080
echo Starting local HTTP server on http://localhost:8080 ...
python -m http.server 8080
pause
