// 메모 모달 전체 화면 오버레이 강화 스크립트
// 메모창이 열릴 때 전체 화면에 회색 오버레이를 적용

(function() {
    console.log('🎨 메모 모달 오버레이 강화 스크립트 로드됨');

    // 원본 openDateMemoModal 함수 백업
    const originalOpenDateMemoModal = window.openDateMemoModal;

    // openDateMemoModal 함수 강화
    window.openDateMemoModal = function(...args) {
        console.log('🎨 강화된 openDateMemoModal 호출 - 전체 화면 오버레이 적용');

        // 원본 함수 실행
        let result;
        if (originalOpenDateMemoModal) {
            result = originalOpenDateMemoModal.apply(this, args);
        }

        // 잠시 후 오버레이 적용 (DOM이 완전히 로드된 후)
        setTimeout(() => {
            applyFullScreenOverlay();
        }, 100);

        return result;
    };

    // 원본 closeDateMemoModal 함수 백업 및 강화
    const originalCloseDateMemoModal = window.closeDateMemoModal;

    window.closeDateMemoModal = function(...args) {
        console.log('🎨 강화된 closeDateMemoModal 호출 - 오버레이 제거');

        // 오버레이 제거
        removeFullScreenOverlay();

        // 원본 함수 실행
        let result;
        if (originalCloseDateMemoModal) {
            result = originalCloseDateMemoModal.apply(this, args);
        }

        return result;
    };

    // 전체 화면 오버레이 적용 함수
    function applyFullScreenOverlay() {
        const dateMemoModal = document.getElementById('dateMemoModal');

        if (!dateMemoModal) {
            console.log('⚠️ dateMemoModal 요소를 찾을 수 없음');
            return;
        }

        // 모달이 실제로 표시되고 있는지 확인
        const modalStyle = window.getComputedStyle(dateMemoModal);
        if (modalStyle.display === 'none') {
            console.log('⚠️ 모달이 닫혀있어 오버레이 적용 생략');
            return;
        }

        console.log('🎨 전체 화면 회색 오버레이 적용 시작');

        // 기존 오버레이 제거
        const existingOverlay = document.getElementById('fullScreenModalOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // 새로운 전체 화면 오버레이 생성
        const overlay = document.createElement('div');
        overlay.id = 'fullScreenModalOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            pointer-events: none;
        `;

        // body에 오버레이 추가
        document.body.appendChild(overlay);

        // 모달을 오버레이 위에 표시
        dateMemoModal.style.zIndex = '9999';
        dateMemoModal.style.position = 'fixed';

        console.log('✅ 전체 화면 회색 오버레이 적용 완료');
    }

    // 전체 화면 오버레이 제거 함수
    function removeFullScreenOverlay() {
        const overlay = document.getElementById('fullScreenModalOverlay');
        if (overlay) {
            overlay.remove();
            console.log('🗑️ 전체 화면 오버레이 제거 완료');
        }
    }

    // 기존 열린 모달에도 적용
    function applyToExistingModal() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        
        if (dateMemoModal) {
            const modalStyle = window.getComputedStyle(dateMemoModal);
            if (modalStyle.display !== 'none') {
                console.log('🔄 기존 열린 모달에 오버레이 적용');
                applyFullScreenOverlay();
            }
        }
    }

    // DOM이 로드된 후 기존 모달 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyToExistingModal);
    } else {
        applyToExistingModal();
    }

    // MutationObserver로 모달 상태 변화 감지
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.id === 'dateMemoModal') {
                    const display = window.getComputedStyle(target).display;
                    if (display === 'block' || display === 'flex') {
                        console.log('👁️ 모달 표시 감지 - 오버레이 적용');
                        setTimeout(() => {
                            applyFullScreenOverlay();
                        }, 50);
                    } else if (display === 'none') {
                        console.log('👁️ 모달 숨김 감지 - 오버레이 제거');
                        removeFullScreenOverlay();
                    }
                }
            }
        });
    });

    // 관찰 시작
    setTimeout(() => {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            observer.observe(dateMemoModal, {
                attributes: true,
                attributeFilter: ['style']
            });
            console.log('👁️ 모달 상태 관찰 시작');
        }
    }, 1000);

    console.log('✅ 메모 모달 오버레이 강화 스크립트 초기화 완료');
    console.log('🛠️ 이제 메모창이 열릴 때마다 전체 화면 회색 오버레이가 적용됩니다');

})();