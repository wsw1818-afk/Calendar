// 모달 오버레이 방지 시스템
(function() {
    'use strict';

    console.log('🛡️ 모달 오버레이 방지 시스템 시작');

    // 모달 생성 차단 함수
    function blockModalOverlay() {
        // 1. 모든 모달 요소 즉시 숨김
        const modals = document.querySelectorAll('[id*="modal"], [class*="modal"], [class*="overlay"]');
        modals.forEach(modal => {
            modal.style.display = 'none !important';
            modal.style.visibility = 'hidden !important';
            modal.style.opacity = '0 !important';
            modal.style.pointerEvents = 'none !important';
        });

        // 2. show-modal 클래스 제거
        document.querySelectorAll('.show-modal').forEach(el => {
            el.classList.remove('show-modal');
        });

        // 3. 높은 z-index 요소 차단
        document.querySelectorAll('*').forEach(el => {
            const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
            if (zIndex > 100) {
                el.style.display = 'none !important';
                el.style.zIndex = '-1 !important';
            }
        });
    }

    // DOM 변화 감지 및 자동 차단
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // 모달이나 오버레이로 보이는 요소 즉시 차단
                    if (node.id && node.id.includes('modal')) {
                        node.style.display = 'none !important';
                        console.log('🚫 모달 자동 차단:', node.id);
                    }

                    if (node.className && (node.className.includes('modal') || node.className.includes('overlay'))) {
                        node.style.display = 'none !important';
                        console.log('🚫 오버레이 자동 차단:', node.className);
                    }

                    // 높은 z-index 요소 차단
                    const zIndex = parseInt(window.getComputedStyle(node).zIndex) || 0;
                    if (zIndex > 500) {
                        node.style.display = 'none !important';
                        console.log('🚫 고z-index 요소 차단:', zIndex);
                    }
                }
            });
        });
    });

    // DOM 변화 감지 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // 주기적 오버레이 차단 (500ms마다)
    setInterval(blockModalOverlay, 500);

    // 클릭 이벤트 후 즉시 차단
    document.addEventListener('click', () => {
        setTimeout(blockModalOverlay, 10);
        setTimeout(blockModalOverlay, 100);
        setTimeout(blockModalOverlay, 300);
    });

    // 전역 함수로 등록
    window.blockModalOverlay = blockModalOverlay;
    window.preventModalOverlay = blockModalOverlay;

    console.log('✅ 모달 오버레이 방지 시스템 초기화 완료');
    console.log('🛠️ 수동 실행: blockModalOverlay() 또는 preventModalOverlay()');
})();