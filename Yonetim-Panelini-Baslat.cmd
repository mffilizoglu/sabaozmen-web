@echo off
chcp 65001 >nul
title Saba Ozmen - Yonetim Paneli
cd /d "%~dp0"

echo.
echo   Saba Ozmen Avukatlik Ortakligi - Yonetim Paneli
echo   ===============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   HATA: Node.js kurulu degil.
  echo   https://nodejs.org adresinden "LTS" surumunu indirip kurun,
  echo   sonra bu dosyayi tekrar calistirin.
  echo.
  pause
  exit /b 1
)

rem Ilk calistirmada parolayi kullanici belirler; parola diske
rem yalnizca scrypt ozeti olarak yazilir, duz metin saklanmaz.
if not exist "site\content\admin.json" (
  echo   Ilk kurulum: panel icin bir parola belirleyin.
  echo   Bu parolayi not edin - bir daha gosterilmez.
  echo.
  set /p ADMIN_PASSWORD=  Yeni parola:
  echo.
  if "%ADMIN_PASSWORD%"=="" (
    echo   Parola bos olamaz. Tekrar calistirin.
    pause
    exit /b 1
  )
  echo   Parola ayarlandi.
  echo.
)

echo   Sunucu baslatiliyor...
echo   Bu pencereyi KAPATMAYIN - panel acik kaldigi surece calismali.
echo   Kapatmak icin bu pencerede Ctrl+C yapin.
echo.

start "" cmd /c "timeout /t 3 >nul & start http://127.0.0.1:4321/admin"

node site\server.js

echo.
echo   Sunucu durdu.
pause
