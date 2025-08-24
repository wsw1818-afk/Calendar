@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo  🎉 고급 기능 통합 버전 - 달력 앱
echo ========================================
echo.
echo ✨ 모든 요청 기능 구현 완료:
echo    ☁️ 구글 드라이브: 자동 동기화 (5분 간격) + 백업/복원
echo    🎨 고급 테마: 6가지 프리셋 + 커스텀 색상 + 테마 저장
echo    📐 레이아웃: 글자 크기 (10-24px) + 폰트 선택 + 와이드뷰 + 줌
echo    📊 엑셀 내보내기: 날짜 지정 + CSV/JSON/HTML 포맷
echo    📝 메모 시스템: 드래그 이동 + 달력/스티커 UI 구분
echo    🔒 레이아웃 보호: 스티커 실행해도 달력 변형 없음
echo    ⌨️ 단축키: Ctrl+W(와이드), Ctrl+/-/0(줌), ESC(닫기)
echo.

cd /d "%~dp0"

REM Python으로 서버 시작
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python 서버로 시작합니다...
    echo.
    echo 서버가 시작되면 http://localhost:8000 으로 접속하세요.
    echo.
    start "" "http://localhost:8000"
    python -m http.server 8000
) else (
    echo Python이 없습니다. 직접 파일을 열어보세요.
    echo.
    start "" "index.html"
)

pause