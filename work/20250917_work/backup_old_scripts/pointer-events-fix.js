// 🔧 포인터 이벤트 차단 문제 해결 스크립트
console.log('🔧 포인터 이벤트 차단 문제 해결 시작');

// 보이지 않는 모달의 포인터 이벤트 비활성화
function fixInvisibleModalPointerEvents() {
    // 모든 모달 요소 찾기
    const modals = document.querySelectorAll('.modal, #settingsModal, #dateMemoModal, #memoDetailModal, #createModal, #excelModal, #storageModal');

    let fixCount = 0;
    modals.forEach(modal => {
        if (modal) {
            const computedStyle = window.getComputedStyle(modal);
            const isVisible = computedStyle.display !== 'none' &&
                            computedStyle.visibility !== 'hidden' &&
                            computedStyle.opacity !== '0';

            // 보이지 않는 모달의 포인터 이벤트 비활성화
            if (!isVisible) {
                modal.style.pointerEvents = 'none';
                fixCount++;
                console.log(`🚫 보이지 않는 모달의 포인터 이벤트 비활성화: ${modal.id || modal.className}`);
            } else {
                modal.style.pointerEvents = 'auto';
                console.log(`✅ 보이는 모달의 포인터 이벤트 활성화: ${modal.id || modal.className}`);
            }
        }
    });

    console.log(`✅ ${fixCount}개 모달의 포인터 이벤트 수정 완료`);
}

// 페이지 로드시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(fixInvisibleModalPointerEvents, 1000);
    });
} else {
    setTimeout(fixInvisibleModalPointerEvents, 100);
}

// 주기적으로 체크 (5초마다)
setInterval(fixInvisibleModalPointerEvents, 5000);

console.log('✅ 포인터 이벤트 차단 문제 해결 스크립트 로드 완료');