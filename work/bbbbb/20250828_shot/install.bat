@echo off
title 📦 패키지 설치
echo ===============================================
echo    필요한 패키지를 설치합니다
echo ===============================================
echo.

:: Node.js 확인
where node >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [!] Node.js가 설치되어 있지 않습니다.
    echo     https://nodejs.org/ 에서 다운로드하세요.
    pause
    exit
)

echo Node.js 버전:
node --version
echo.
echo NPM 버전:
npm --version
echo.

echo 패키지 설치를 시작합니다...
echo.

npm install

echo.
echo ===============================================
echo    설치 완료!
echo    '미디어매니저_실행.bat'을 실행하세요.
echo ===============================================
pause