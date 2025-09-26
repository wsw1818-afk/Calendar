/**
 * 간단한 클릭 테스트 스크립트
 * 날짜와 메뉴 클릭이 제대로 작동하는지 확인
 */

(function() {
    'use strict';

    console.log('🔧 간단한 클릭 테스트 스크립트 로드됨');

    // 페이지 로드 후 실행
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ DOM 로드 완료 - 클릭 이벤트 확인 중');

        // 모든 클릭 이벤트 모니터링
        document.addEventListener('click', function(e) {
            console.log('🖱️ 클릭됨:', e.target);
            console.log('  - 태그:', e.target.tagName);
            console.log('  - 클래스:', e.target.className);
            console.log('  - ID:', e.target.id);
            console.log('  - 텍스트:', e.target.textContent?.substring(0, 50));
        });

        // 달력 날짜 클릭 테스트
        setTimeout(() => {
            const days = document.querySelectorAll('.day');
            console.log(`📅 찾은 달력 날짜: ${days.length}개`);

            days.forEach((day, index) => {
                if (index < 3) { // 처음 3개만 로그
                    console.log(`  날짜 ${index + 1}:`, day.textContent, day.className);
                }
            });
        }, 1000);

        // 메뉴 버튼 클릭 테스트
        setTimeout(() => {
            const menuButtons = document.querySelectorAll('button, .btn, [onclick]');
            console.log(`🔘 찾은 버튼: ${menuButtons.length}개`);

            menuButtons.forEach((btn, index) => {
                if (index < 5) { // 처음 5개만 로그
                    console.log(`  버튼 ${index + 1}:`, btn.textContent?.substring(0, 30), btn.className);
                }
            });
        }, 1000);
    });

    console.log('🎯 클릭 테스트 스크립트 초기화 완료');
})();