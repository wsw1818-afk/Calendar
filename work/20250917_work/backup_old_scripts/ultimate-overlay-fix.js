// 궁극적인 전체 화면 오버레이 솔루션
// 다른 스크립트의 간섭을 방지하고 CSS를 통한 강력한 오버레이 적용

(function() {
    console.log('🎯 궁극적인 전체 화면 오버레이 솔루션 로드됨');

    // CSS 스타일 생성 및 주입
    function injectOverlayStyles() {
        const styleId = 'ultimate-overlay-styles';

        // 기존 스타일 제거
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 전체 화면 오버레이 클래스 */
            .ultimate-fullscreen-overlay::before {
                content: '';
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background-color: rgba(0, 0, 0, 0.5) !important;
                z-index: 9998 !important;
                pointer-events: none !important;
            }

            /* 메모 모달이 오버레이 위에 표시되도록 */
            #dateMemoModal.ultimate-fullscreen-overlay {
                z-index: 9999 !important;
                position: fixed !important;
            }

            /* 모달 콘텐츠는 클릭 가능하게 */
            #dateMemoModal.ultimate-fullscreen-overlay .memo-modal-content {
                pointer-events: auto !important;
                position: relative !important;
                z-index: 10000 !important;
            }
        `;

        document.head.appendChild(style);
        console.log('✅ 궁극적인 오버레이 CSS 스타일 주입 완료');
    }

    // 모달에 오버레이 클래스 적용
    function applyUltimateOverlay() {
        const dateMemoModal = document.getElementById('dateMemoModal');

        if (!dateMemoModal) {
            console.log('⚠️ dateMemoModal 요소를 찾을 수 없음');
            return;
        }

        const modalStyle = window.getComputedStyle(dateMemoModal);
        if (modalStyle.display === 'none') {
            console.log('⚠️ 모달이 닫혀있어 오버레이 적용 생략');
            return;
        }

        console.log('🎯 궁극적인 전체 화면 오버레이 적용 시작');

        // 클래스 추가
        dateMemoModal.classList.add('ultimate-fullscreen-overlay');

        console.log('✅ 궁극적인 전체 화면 오버레이 적용 완료');
    }

    // 모달에서 오버레이 클래스 제거
    function removeUltimateOverlay() {
        const dateMemoModal = document.getElementById('dateMemoModal');

        if (dateMemoModal) {
            dateMemoModal.classList.remove('ultimate-fullscreen-overlay');
            console.log('🗑️ 궁극적인 오버레이 클래스 제거 완료');
        }
    }

    // 원본 함수 백업 및 강화
    const originalOpenDateMemoModal = window.openDateMemoModal;
    const originalCloseDateMemoModal = window.closeDateMemoModal;

    window.openDateMemoModal = function(...args) {
        console.log('🎯 강화된 openDateMemoModal 호출 - 궁극적인 오버레이 적용');

        let result;
        if (originalOpenDateMemoModal) {
            result = originalOpenDateMemoModal.apply(this, args);
        }

        // CSS 주입 및 오버레이 적용
        setTimeout(() => {
            injectOverlayStyles();
            applyUltimateOverlay();
        }, 100);

        return result;
    };

    window.closeDateMemoModal = function(...args) {
        console.log('🎯 강화된 closeDateMemoModal 호출 - 궁극적인 오버레이 제거');

        removeUltimateOverlay();

        let result;
        if (originalCloseDateMemoModal) {
            result = originalCloseDateMemoModal.apply(this, args);
        }

        return result;
    };

    // MutationObserver로 모달 상태 변화 감지
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.id === 'dateMemoModal') {
                    const display = window.getComputedStyle(target).display;
                    if (display === 'block' || display === 'flex') {
                        console.log('👁️ 모달 표시 감지 - 궁극적인 오버레이 적용');
                        setTimeout(() => {
                            injectOverlayStyles();
                            applyUltimateOverlay();
                        }, 50);
                    } else if (display === 'none') {
                        console.log('👁️ 모달 숨김 감지 - 궁극적인 오버레이 제거');
                        removeUltimateOverlay();
                    }
                }
            }
        });
    });

    // 초기화
    function initialize() {
        // CSS 스타일 주입
        injectOverlayStyles();

        // 기존 열린 모달에만 적용 (실제로 표시되는 경우에만)
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            const modalStyle = window.getComputedStyle(dateMemoModal);
            if (modalStyle.display === 'block' || modalStyle.display === 'flex') {
                console.log('🔄 기존 열린 모달에 궁극적인 오버레이 적용');
                applyUltimateOverlay();
            } else {
                console.log('📋 모달이 닫혀있어 오버레이 적용하지 않음');
                removeUltimateOverlay();
            }

            // 관찰 시작
            observer.observe(dateMemoModal, {
                attributes: true,
                attributeFilter: ['style']
            });
            console.log('👁️ 궁극적인 모달 상태 관찰 시작');
        }
    }

    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 1000);
    }

    console.log('✅ 궁극적인 전체 화면 오버레이 솔루션 초기화 완료');
    console.log('🛠️ 이제 어떤 간섭도 없이 메모창에 전체 화면 회색 오버레이가 적용됩니다');

})();