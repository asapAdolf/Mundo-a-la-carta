@echo off
title Mundo a la Carta - Gestion de Empleados
color 0E

echo ================================================================
echo   MUNDO A LA CARTA - SISTEMA DE GESTION DE EMPLEADOS
echo ================================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js detectado.
    echo Iniciando servidor en http://localhost:3000 ...
    echo.
    start "" http://localhost:3000
    node server.js
    pause
    exit /b
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Usando Python como servidor alternativo...
    start "" http://localhost:3000
    python -m http.server 3000
    pause
    exit /b
)

echo [ERROR] No se detecto Node.js ni Python instalado en el sistema.
echo Por favor instala Node.js desde https://nodejs.org/
echo.
pause
