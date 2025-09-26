// 🖱️ 실제 마우스 클릭 기반 모달 수정 스크립트
console.log('🖱️ 실제 마우스 클릭 기반 모달 수정 시작');

// CSS 강제 주입으로 모든 숨김 방지
function injectForceVisibleCSS() {
    const style = document.createElement('style');
    style.id = 'force-visible-modals';
    style.innerHTML = `
        /* 모든 ultimate-hidden 클래스 무력화 */
        .ultimate-hidden {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* 모달들 강제 표시 CSS */
        #dateMemoModal, #settingsModal, #memoDetailModal {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: fixed !important;
            z-index: 999999 !important;
        }

        /* 모달 내용물도 강제 표시 */
        #dateMemoModal .modal-content,
        #settingsModal .modal-content,
        #memoDetailModal .modal-content {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* 기본 모달 스타일 */
        .modal-force-show {
            display: flex !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: white !important;
            border: 2px solid #333 !important;
            border-radius: 10px !important;
            padding: 20px !important;
            min-width: 400px !important;
            min-height: 300px !important;
            z-index: 999999 !important;
            visibility: visible !important;
            opacity: 1 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ 강제 표시 CSS 주입 완료');
}

// 모든 숨김 클래스 완전 제거 및 방지
function removeAllHidingClasses() {
    const hiddenElements = document.querySelectorAll('.ultimate-hidden, .hidden, [style*="display: none"], [style*="visibility: hidden"]');
    console.log(`🔧 숨김 요소 발견: ${hiddenElements.length}개`);

    hiddenElements.forEach((el, i) => {
        el.classList.remove('ultimate-hidden', 'hidden');
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        console.log(`✅ ${i + 1}. ${el.tagName}.${el.className} 표시 복원`);
    });

    // 모달들 특별 처리
    ['dateMemoModal', 'settingsModal', 'memoDetailModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('modal-force-show');
            modal.classList.remove('ultimate-hidden', 'hidden');
            console.log(`✅ ${modalId} 강제 표시 클래스 추가`);
        }
    });
}

// 실시간 모달 보호 시스템
function setupModalProtection() {
    // DOM 변화 감지 및 즉시 복원
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
                const target = mutation.target;
                if (target.classList.contains('ultimate-hidden') ||
                    target.style.display === 'none' ||
                    target.style.visibility === 'hidden') {
                    console.log(`🛡️ 모달 숨김 시도 차단: ${target.id || target.className}`);
                    target.classList.remove('ultimate-hidden', 'hidden');
                    target.style.display = 'flex';
                    target.style.visibility = 'visible';
                    target.style.opacity = '1';
                }
            }
        });
    });

    // 모든 모달 요소 보호
    ['dateMemoModal', 'settingsModal', 'memoDetailModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            console.log(`🛡️ ${modalId} 실시간 보호 시작`);
        }
    });

    console.log('✅ 실시간 모달 보호 시스템 활성화');
}

// 실제 마우스 클릭 이벤트 처리
function setupRealMouseClicks() {
    // 날짜 클릭 처리
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.day');
        if (target && e.isTrusted) { // 실제 사용자 클릭만 처리
            const dayText = target.textContent.trim();
            const day = parseInt(dayText);

            if (!isNaN(day) && day >= 1 && day <= 31) {
                console.log(`🖱️ 실제 날짜 클릭 감지: ${day}일`);

                // 모든 숨김 해제
                removeAllHidingClasses();

                // 날짜 모달 강제 표시
                const dateMemoModal = document.getElementById('dateMemoModal');
                if (dateMemoModal) {
                    dateMemoModal.classList.add('modal-force-show');
                    dateMemoModal.classList.remove('ultimate-hidden', 'hidden');
                    dateMemoModal.style.display = 'flex';
                    dateMemoModal.style.visibility = 'visible';
                    dateMemoModal.style.opacity = '1';
                    dateMemoModal.style.zIndex = '999999';

                    // 날짜 설정
                    const modalDay = document.getElementById('modalDay');
                    if (modalDay) modalDay.value = day;

                    console.log(`✅ 날짜 모달 강제 표시 완료: ${day}일`);
                } else {
                    console.log('❌ dateMemoModal 찾을 수 없음');
                }
            }
        }
    }, true); // capture 단계에서 처리

    // 설정 버튼 클릭 처리
    document.addEventListener('click', function(e) {
        if (e.target.id === 'settingsBtn' && e.isTrusted) {
            console.log('🖱️ 실제 설정 버튼 클릭 감지');

            // 모든 숨김 해제
            removeAllHidingClasses();

            // 설정 모달 강제 표시
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                settingsModal.classList.add('modal-force-show');
                settingsModal.classList.remove('ultimate-hidden', 'hidden');
                settingsModal.style.display = 'flex';
                settingsModal.style.visibility = 'visible';
                settingsModal.style.opacity = '1';
                settingsModal.style.zIndex = '999999';

                console.log('✅ 설정 모달 강제 표시 완료');
            } else {
                console.log('❌ settingsModal 찾을 수 없음');
            }
        }
    }, true); // capture 단계에서 처리

    console.log('✅ 실제 마우스 클릭 이벤트 등록 완료');
}

// 페이지 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 실제 마우스 클릭 기반 모달 시스템 초기화');

        // CSS 주입
        injectForceVisibleCSS();

        // 초기 정리
        removeAllHidingClasses();

        // 실시간 보호 설정
        setupModalProtection();

        // 실제 클릭 이벤트 설정
        setupRealMouseClicks();

        console.log('✅ 실제 마우스 클릭 기반 모달 시스템 준비 완료');
        console.log('🖱️ 이제 마우스로 날짜나 설정 버튼을 클릭해보세요');
    }, 2000); // 다른 스크립트들 로드 후 실행
});

// 전역 함수로 수동 테스트 지원
window.testMouseClickFix = function() {
    console.log('🧪 마우스 클릭 수정 테스트 시작');
    removeAllHidingClasses();
    setupModalProtection();
    console.log('✅ 수동 테스트 완료');
};

console.log('✅ 실제 마우스 클릭 기반 모달 수정 스크립트 로드 완료');