// 최종 모달 정리 스크립트 (dateMemoModal/memoDetailModal 보호)
(function() {
    console.log('✅ 궁극적인 모달 정리 스크립트 로드');

    const REMNANT_SELECTORS = [
        '.modal-backdrop',
        '.modal-overlay',
        '.backdrop',
        '.overlay',
        '.modal-close-btn',
        '.memo-modal-content',
        '[class*="modal-content"]',
        '[class*="modal-close"]',
        '[class*="modal-backdrop"]',
        '[class*="modal-overlay"]'
    ];

    function isProtected(element) {
        if (!element) return false;
        if (element.id === 'dateMemoModal' || element.id === 'memoDetailModal') {
            return true;
        }
        return Boolean(element.closest && (element.closest('#dateMemoModal') || element.closest('#memoDetailModal')));
    }

    function hideElement(element) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.style.zIndex = '-9999';
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '-9999px';
        element.style.transform = 'translateX(-100vw)';
        element.classList.add('ultimate-hidden');
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('data-cleanup-processed', 'true');
    }

    function cleanupModalRemnants() {
        let cleanedCount = 0;

        REMNANT_SELECTORS.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                if (isProtected(element)) {
                    return;
                }

                const computed = window.getComputedStyle(element);
                if (computed.display === 'none' && computed.visibility === 'hidden') {
                    return;
                }

                hideElement(element);
                cleanedCount += 1;
                console.log('[ultimate-modal-cleanup] 숨김 처리:', selector, element.className || element.id || element.tagName);
            });
        });

        if (cleanedCount) {
            console.log(`[ultimate-modal-cleanup] 총 ${cleanedCount}개 요소 정리`);
        }
        return cleanedCount;
    }

    function forceCleanupAllRemnants() {
        let cleanedCount = 0;
        document.querySelectorAll('[class*="modal"], [class*="backdrop"], [class*="overlay"]').forEach((element) => {
            if (isProtected(element)) {
                return;
            }
            hideElement(element);
            cleanedCount += 1;
        });
        console.log(`[ultimate-modal-cleanup] 전체 정리 실행: ${cleanedCount}`);
        return cleanedCount;
    }

    function addUltimateHiddenStyles() {
        if (document.getElementById('ultimate-hidden-style')) {
            return;
        }
        const style = document.createElement('style');
        style.id = 'ultimate-hidden-style';
        style.textContent = `
            .ultimate-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -9999 !important;
                transform: translateX(-100vw) !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function enhanceCloseMemoDetail() {
        if (typeof window.closeMemoDetail !== 'function') {
            setTimeout(enhanceCloseMemoDetail, 1000);
            return;
        }
        const original = window.closeMemoDetail;
        window.closeMemoDetail = function() {
            const result = original.apply(this, arguments);
            setTimeout(cleanupModalRemnants, 50);
            setTimeout(cleanupModalRemnants, 200);
            return result;
        };
    }

    function enhanceEscKeyCleanup() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' || event.keyCode === 27) {
                setTimeout(cleanupModalRemnants, 120);
            }
        });
    }

    function init() {
        addUltimateHiddenStyles();
        enhanceCloseMemoDetail();
        enhanceEscKeyCleanup();
        cleanupModalRemnants();
        setTimeout(cleanupModalRemnants, 100);
        setTimeout(cleanupModalRemnants, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', () => {
        cleanupModalRemnants();
        setTimeout(cleanupModalRemnants, 300);
    });

    window.cleanupModalRemnants = cleanupModalRemnants;
    window.forceCleanupAllRemnants = forceCleanupAllRemnants;
    window.debugModalCleanup = function() {
        return {
            total: document.querySelectorAll('[class*="modal"]').length,
            hidden: document.querySelectorAll('.ultimate-hidden').length,
        };
    };
})();