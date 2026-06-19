@echo off
setlocal

pushd "%~dp0frontend" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Frontend directory not found:
  echo "%~dp0frontend"
  goto :failed
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm.cmd was not found. Install Node.js LTS and try again.
  goto :failed_with_popd
)

if not exist "node_modules\" (
  echo [INFO] node_modules is missing. Installing frontend dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] Frontend dependency installation failed.
    goto :failed_with_popd
  )
)

echo [INFO] Starting frontend at http://127.0.0.1:3000
call npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [ERROR] Frontend server exited with code %EXIT_CODE%.
)

popd
echo.
pause
exit /b %EXIT_CODE%

:failed_with_popd
popd

:failed
echo.
pause
exit /b 1
