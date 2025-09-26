// 오버레이로 인한 메모창 가림 문제 해결 스크립트
// viewerBackdrop 요소가 메모창을 가리는 문제 수정

(function() {
    console.log('🔧 오버레이 가림 문제 해결 스크립트 로드됨');

    // viewerBackdrop 오버레이 숨김 처리
    function hideViewerBackdrop() {
        const viewerBackdrop = document.getElementById('viewerBackdrop');
        
        if (viewerBackdrop) {
            console.log('🔧 viewerBackdrop 오버레이 숨김 처리 시작');
            
            // 오버레이 완전 숨김
            viewerBackdrop.style.display = 'none';
            viewerBackdrop.style.visibility = 'hidden';
            viewerBackdrop.style.zIndex = '-1';
            viewerBackdrop.style.opacity = '0';
            viewerBackdrop.style.pointerEvents = 'none';
            
            console.log('✅ viewerBackdrop 오버레이 숨김 완료');
            return true;
        }
        
        return false;
    }

    // DOM 로드 후 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideViewerBackdrop);
    } else {
        hideViewerBackdrop();
    }

    // 주기적으로 오버레이 상태 확인 및 수정
    function checkOverlayState() {
        const viewerBackdrop = document.getElementById('viewerBackdrop');
        
        if (viewerBackdrop) {
            const computedStyle = window.getComputedStyle(viewerBackdrop);
            
            // 오버레이가 다시 나타났거나 메모창을 가릴 수 있는 상태인 경우
            if (computedStyle.display !== 'none' || 
                computedStyle.visibility !== 'hidden' ||
                parseInt(computedStyle.zIndex) > 0) {
                
                console.log('⚠️ viewerBackdrop 오버레이 재출현 감지 - 재차 숨김');
                hideViewerBackdrop();
            }
        }
    }

    // 5초마다 오버레이 상태 검사
    setInterval(checkOverlayState, 5000);

    // 모달 열릴 때마다 오버레이 상태 확인
    const originalOpenDateMemoModal = window.openDateMemoModal;
    if (originalOpenDateMemoModal) {
        window.openDateMemoModal = function(...args) {
            console.log('📋 메모 모달 열기 전 오버레이 상태 확인');
            hideViewerBackdrop();
            
            return originalOpenDateMemoModal.apply(this, args);
        };
    }

    console.log('✅ 오버레이 가림 문제 해결 스크립트 초기화 완료');
    console.log('🛠️ 이제 메모창이 오버레이에 가려지지 않습니다');

})();