@echo off
setlocal

pushd "%~dp0backend" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Backend directory not found:
  echo "%~dp0backend"
  goto :failed
)

set "PYTHON_CMD="
if exist ".venv\Scripts\python.exe" set "PYTHON_CMD=.venv\Scripts\python.exe"

if not defined PYTHON_CMD (
  where py.exe >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=py.exe -3"
)

if not defined PYTHON_CMD (
  where python.exe >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=python.exe"
)

if not defined PYTHON_CMD (
  echo [ERROR] Python was not found.
  echo Create backend\.venv or install Python 3.11 or later.
  goto :failed_with_popd
)

%PYTHON_CMD% -c "import uvicorn" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Backend dependencies are not installed.
  echo Run: %PYTHON_CMD% -m pip install -r requirements.txt
  goto :failed_with_popd
)

echo [INFO] Starting backend at http://127.0.0.1:8000
%PYTHON_CMD% -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [ERROR] Backend server exited with code %EXIT_CODE%.
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
