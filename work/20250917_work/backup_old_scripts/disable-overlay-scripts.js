// 앱 시작시 오버레이 스크립트 비활성화 및 정리
// 여러 오버레이 스크립트들이 초기 실행시 화면을 가리는 문제 해결

(function() {
    console.log('🚫 오버레이 스크립트 비활성화 시작');

    // 페이지 로드 즉시 실행
    function disableOverlayScripts() {
        // 1. modal-overlay-enhancement.js 비활성화
        if (window.applyFullScreenOverlay) {
            window.applyFullScreenOverlay = function() {
                console.log('🚫 applyFullScreenOverlay 차단됨');
                return false;
            };
        }

        // 2. ultimate-overlay-fix.js 비활성화
        if (window.injectOverlayStyles) {
            window.injectOverlayStyles = function() {
                console.log('🚫 injectOverlayStyles 차단됨');
                return false;
            };
        }

        // 3. 기존 오버레이 클래스 제거
        const overlayClasses = [
            'ultimate-fullscreen-overlay',
            'modal-overlay-active',
            'fullscreen-overlay',
            'overlay-active'
        ];

        // body와 모든 모달에서 오버레이 클래스 제거
        document.body.classList.remove(...overlayClasses);

        const modals = document.querySelectorAll('[id*="Modal"], [class*="modal"]');
        modals.forEach(modal => {
            modal.classList.remove(...overlayClasses);
        });

        // 4. 오버레이 스타일 요소 제거
        const overlayStyles = document.querySelectorAll('#ultimate-overlay-styles, #modal-overlay-styles, [id*="overlay-style"]');
        overlayStyles.forEach(style => style.remove());

        // 5. CSS 변수 초기화
        document.documentElement.style.setProperty('--overlay-opacity', '0');
        document.documentElement.style.setProperty('--overlay-display', 'none');

        console.log('✅ 오버레이 스크립트 비활성화 완료');
    }

    // 즉시 실행
    disableOverlayScripts();

    // DOM 로드 후에도 한번 더 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', disableOverlayScripts);
    }

    // 페이지 완전 로드 후에도 실행
    window.addEventListener('load', disableOverlayScripts);

    // MutationObserver로 동적 변경 감시
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                const overlayClasses = ['ultimate-fullscreen-overlay', 'modal-overlay-active'];

                overlayClasses.forEach(className => {
                    if (target.classList.contains(className)) {
                        target.classList.remove(className);
                        console.log(`🚫 동적 오버레이 클래스 제거됨: ${className}`);
                    }
                });
            }
        });
    });

    // body와 주요 모달 요소들 감시
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    setTimeout(() => {
        const modals = document.querySelectorAll('[id*="Modal"]');
        modals.forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        });
    }, 1000);

    console.log('🛡️ 오버레이 방지 시스템 활성화 완료');
})();