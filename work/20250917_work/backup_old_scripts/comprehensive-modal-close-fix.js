// 포괄적인 모달 닫기 문제 해결 스크립트
// CSS와 JavaScript 스타일 충돌로 인한 잔여창 버그 완전 해결

(function() {
    console.log('🔧 포괄적인 모달 닫기 문제 해결 스크립트 로드됨');

    // 모달을 완전히 닫는 함수
    function forceCloseModal(modal) {
        if (!modal) return false;

        // 모든 가능한 스타일 속성으로 완전 숨김
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.zIndex = '-9999';
        modal.style.transform = 'translateX(-100vw)';
        modal.style.position = 'absolute';
        modal.style.left = '-9999px';
        modal.style.top = '-9999px';

        // CSS 클래스로도 숨김 처리
        modal.classList.add('force-hidden');
        modal.classList.remove('show', 'active', 'visible', 'open');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('data-force-closed', 'true');

        console.log('💪 모달 강제 닫기 완료:', modal.id);
        return true;
    }

    // 모달 백드롭/오버레이도 함께 처리
    function closeModalBackdrop() {
        const backdrops = document.querySelectorAll('.modal-backdrop, .backdrop, .overlay, [class*="backdrop"], [class*="overlay"]');
        backdrops.forEach(backdrop => {
            forceCloseModal(backdrop);
        });
    }

    // 원본 closeMemoDetail 함수 강화
    function enhanceCloseMemoDetail() {
        if (window.closeMemoDetail) {
            const originalCloseMemoDetail = window.closeMemoDetail;

            window.closeMemoDetail = function() {
                console.log('🔧 강화된 closeMemoDetail 호출 - 포괄적 닫기 포함');

                // 원본 함수 실행
                const result = originalCloseMemoDetail.apply(this, arguments);

                // 강제 닫기 처리
                setTimeout(() => {
                    const memoDetailModal = document.getElementById('memoDetailModal');
                    const dateMemoModal = document.getElementById('dateMemoModal');

                    // 메모 상세 모달 강제 닫기
                    if (memoDetailModal) {
                        forceCloseModal(memoDetailModal);
                    }

                    // 날짜 메모 모달이 보여야 하는 경우 정상 표시
                    if (dateMemoModal) {
                        // 강제 닫기 스타일 제거 (원래 상태로 복원)
                        dateMemoModal.style.display = 'block';
                        dateMemoModal.style.visibility = 'visible';
                        dateMemoModal.style.opacity = '1';
                        dateMemoModal.style.zIndex = '1000';
                        dateMemoModal.style.transform = '';
                        dateMemoModal.style.position = '';
                        dateMemoModal.style.left = '';
                        dateMemoModal.style.top = '';

                        dateMemoModal.classList.remove('force-hidden');
                        dateMemoModal.setAttribute('aria-hidden', 'false');
                        dateMemoModal.removeAttribute('data-force-closed');

                        console.log('✅ 날짜 메모 모달 정상 복원 완료');

                        // 잠금 상태 확인하여 입력 영역 처리
                        setTimeout(() => {
                            const lockButton = dateMemoModal.querySelector('.lock-button, [onclick*="lock"], [class*="lock"]');
                            const isLocked = lockButton &&
                                (lockButton.textContent.includes('잠금') ||
                                 lockButton.classList.contains('locked'));

                            if (isLocked) {
                                // 잠금 상태면 입력 영역 숨기기
                                const inputElements = dateMemoModal.querySelectorAll('input[type="text"], textarea, [placeholder*="메모"]');
                                inputElements.forEach(input => {
                                    const container = input.closest('div, section, form');
                                    if (container && container !== dateMemoModal) {
                                        container.style.display = 'none';
                                        container.style.visibility = 'hidden';
                                    }
                                });
                                console.log('🔒 잠금 상태 - 입력 영역 숨김 처리');
                            }
                        }, 50);
                    }

                    // 백드롭도 정리
                    closeModalBackdrop();

                    console.log('✅ 포괄적 모달 닫기 처리 완료');
                }, 50);

                return result;
            };

            console.log('✅ closeMemoDetail 함수 포괄적 강화 완료');
        } else {
            console.log('⚠️ closeMemoDetail 함수 없음 - 나중에 재시도');
            setTimeout(enhanceCloseMemoDetail, 1000);
        }
    }

    // ESC 키 핸들러도 강화
    function enhanceEscKeyHandler() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                const memoDetailModal = document.getElementById('memoDetailModal');

                if (memoDetailModal &&
                    (memoDetailModal.style.display === 'block' ||
                     window.getComputedStyle(memoDetailModal).display !== 'none')) {

                    console.log('🔑 ESC 키 감지 - 포괄적 모달 닫기 실행');

                    // 기존 ESC 처리 차단
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();

                    // closeMemoDetail 실행 (이미 강화된 버전)
                    if (window.closeMemoDetail) {
                        window.closeMemoDetail();
                    } else {
                        // 직접 강제 닫기
                        forceCloseModal(memoDetailModal);
                        closeModalBackdrop();
                    }
                }
            }
        }, true); // capture phase에서 최우선 처리

        console.log('✅ ESC 키 포괄적 모달 닫기 핸들러 등록 완료');
    }

    // 모든 모달 닫기 함수 (디버깅용)
    function forceCloseAllModals() {
        const allModals = document.querySelectorAll('[id*="modal"], [class*="modal"], .popup, .dialog');
        let closedCount = 0;

        allModals.forEach(modal => {
            if (forceCloseModal(modal)) {
                closedCount++;
            }
        });

        closeModalBackdrop();
        console.log(`💪 모든 모달 강제 닫기 완료: ${closedCount}개`);
        return closedCount;
    }

    // CSS 강제 숨김 클래스 추가
    function addForceHiddenStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .force-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -9999 !important;
                transform: translateX(-100vw) !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ 강제 숨김 CSS 클래스 추가 완료');
    }

    // 디버깅 함수들
    window.debugModalState = function() {
        const memoDetailModal = document.getElementById('memoDetailModal');
        const dateMemoModal = document.getElementById('dateMemoModal');

        return {
            memoDetail: memoDetailModal ? {
                id: memoDetailModal.id,
                display: memoDetailModal.style.display,
                computedDisplay: window.getComputedStyle(memoDetailModal).display,
                visibility: memoDetailModal.style.visibility,
                opacity: memoDetailModal.style.opacity,
                zIndex: memoDetailModal.style.zIndex,
                forceClosed: memoDetailModal.getAttribute('data-force-closed')
            } : 'Not found',
            dateMemo: dateMemoModal ? {
                id: dateMemoModal.id,
                display: dateMemoModal.style.display,
                computedDisplay: window.getComputedStyle(dateMemoModal).display,
                visibility: dateMemoModal.style.visibility,
                forceClosed: dateMemoModal.getAttribute('data-force-closed')
            } : 'Not found'
        };
    };

    window.forceCloseAllModals = forceCloseAllModals;

    // 초기화
    function init() {
        addForceHiddenStyles();
        enhanceCloseMemoDetail();
        enhanceEscKeyHandler();

        console.log('✅ 포괄적인 모달 닫기 문제 해결 시스템 초기화 완료');
        console.log('🛠️ 디버깅: debugModalState(), forceCloseAllModals()');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 실행
    window.addEventListener('load', function() {
        setTimeout(init, 500);
    });

})();