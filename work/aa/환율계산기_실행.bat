@echo off
chcp 65001 > nul
title 환율 계산기

echo.
echo ===================================
echo    💰 원화 환율 계산기 시작
echo ===================================
echo.

if not exist node_modules (
    echo ⚠️  필요한 패키지가 설치되지 않았습니다.
    echo 📦 패키지를 설치합니다...
    echo.
    call npm install
    echo.
)

echo 🚀 서버를 시작합니다...
echo.
echo 📱 브라우저가 자동으로 열립니다.
echo    만약 열리지 않으면 아래 주소로 접속하세요:
echo    http://localhost:3030
echo.
echo 🔄 종료하려면 Ctrl + C를 누르세요.
echo ===================================
echo.

timeout /t 2 > nul
start http://localhost:3030
node server.js