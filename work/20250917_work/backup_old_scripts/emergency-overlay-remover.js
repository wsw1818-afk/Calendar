// 긴급 오버레이 제거 스크립트
(function() {
    'use strict';

    console.log('🚨 긴급 오버레이 제거 시스템 시작');

    function removeAllOverlays() {
        let totalRemoved = 0;

        // 1. 모든 모달 오버레이 찾기 및 제거
        const modals = document.querySelectorAll('[id*="modal"], [class*="modal"], [class*="overlay"]');
        console.log(`발견된 모달: ${modals.length}개`);

        modals.forEach((modal, index) => {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.classList.remove('show-modal', 'show');
            totalRemoved++;
        });

        // 2. show-modal 클래스가 있는 요소들 제거
        const showModals = document.querySelectorAll('.show-modal');
        console.log(`show-modal 클래스: ${showModals.length}개`);

        showModals.forEach((modal) => {
            modal.classList.remove('show-modal');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            totalRemoved++;
        });

        // 3. z-index가 높은 요소들 숨김
        const allElements = document.querySelectorAll('*');
        let hiddenZIndex = 0;

        allElements.forEach(el => {
            const zIndex = window.getComputedStyle(el).zIndex;
            if (parseInt(zIndex) > 1000) {
                el.style.display = 'none';
                hiddenZIndex++;
            }
        });

        // 4. 백그라운드 오버레이 완전 제거
        const overlayElements = document.querySelectorAll('div[style*="background"], div[style*="rgba"], .backdrop');
        overlayElements.forEach(el => {
            const bgColor = window.getComputedStyle(el).backgroundColor;
            if (bgColor.includes('rgba') || bgColor.includes('rgb')) {
                el.style.display = 'none';
                totalRemoved++;
            }
        });

        console.log(`✅ 총 ${totalRemoved}개 모달, ${hiddenZIndex}개 고z-index 요소 제거 완료`);

        return {
            modals: modals.length,
            showModals: showModals.length,
            hiddenZIndex: hiddenZIndex,
            total: totalRemoved
        };
    }

    // 페이지 로드 시 자동 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeAllOverlays);
    } else {
        removeAllOverlays();
    }

    // 전역 함수로 등록
    window.emergencyOverlayRemover = removeAllOverlays;
    window.clearAllOverlays = removeAllOverlays;

    console.log('🛠️ 사용법: emergencyOverlayRemover() 또는 clearAllOverlays()');
    console.log('✅ 긴급 오버레이 제거 시스템 초기화 완료');
})();