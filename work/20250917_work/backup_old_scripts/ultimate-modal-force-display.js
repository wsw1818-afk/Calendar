// 🔧 궁극적인 모달 강제 표시 수정 스크립트
console.log('🔧 궁극적인 모달 강제 표시 시작');

// 최고 우선순위 CSS 주입
function injectUltimateCSS() {
    const style = document.createElement('style');
    style.id = 'ultimate-modal-force-css';
    style.innerHTML = `
        /* 절대적 모달 표시 강제 */
        #dateMemoModal, #settingsModal, #memoDetailModal {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: fixed !important;
            z-index: 999999 !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: white !important;
            border: 2px solid #333 !important;
            border-radius: 10px !important;
            padding: 20px !important;
            min-width: 400px !important;
            min-height: 300px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        }

        /* 모달 내용물도 강제 표시 */
        #dateMemoModal *, #settingsModal *, #memoDetailModal * {
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* 모든 숨김 클래스 무효화 */
        .ultimate-hidden, .hidden, [style*="display: none"], [style*="visibility: hidden"] {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* 백드롭 제거 */
        .modal-backdrop, .backdrop, .overlay {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ 궁극적 강제 CSS 주입 완료');
}

// 스타일 변경 감시 및 즉시 복원
function setupUltimateStyleProtection() {
    const protectModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // MutationObserver로 스타일 변경 감시
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.style.display === 'none' ||
                        target.style.visibility === 'hidden' ||
                        target.style.opacity === '0') {

                        console.log(`🛡️ ${modalId} 숨김 시도 차단 - 즉시 복원`);
                        target.style.display = 'flex';
                        target.style.visibility = 'visible';
                        target.style.opacity = '1';
                        target.style.position = 'fixed';
                        target.style.zIndex = '999999';
                        target.style.top = '50%';
                        target.style.left = '50%';
                        target.style.transform = 'translate(-50%, -50%)';
                    }
                }
            });
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        console.log(`🛡️ ${modalId} 실시간 스타일 보호 활성화`);
    };

    ['dateMemoModal', 'settingsModal', 'memoDetailModal'].forEach(protectModal);
}

// 모달 강제 표시 함수
function ultimateForceShowModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.log(`❌ ${modalId} 모달 요소 없음`);
        return false;
    }

    // 모든 숨김 클래스 제거
    modal.classList.remove('ultimate-hidden', 'hidden', 'd-none');

    // 인라인 스타일 강제 설정
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.position = 'fixed';
    modal.style.zIndex = '999999';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'white';
    modal.style.border = '2px solid #333';
    modal.style.borderRadius = '10px';
    modal.style.padding = '20px';
    modal.style.minWidth = '400px';
    modal.style.minHeight = '300px';
    modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';

    // 내부 요소들도 표시
    const children = modal.querySelectorAll('*');
    children.forEach(child => {
        child.style.visibility = 'visible';
        child.style.opacity = '1';
        if (child.classList.contains('ultimate-hidden')) {
            child.classList.remove('ultimate-hidden');
        }
    });

    console.log(`✅ ${modalId} 궁극적 강제 표시 완료`);
    return true;
}

// 실제 마우스 클릭 이벤트 처리
function setupUltimateClickHandlers() {
    // 날짜 클릭 처리
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.day');
        if (target && e.isTrusted) {
            const dayText = target.textContent.trim();
            const day = parseInt(dayText);

            if (!isNaN(day) && day >= 1 && day <= 31) {
                console.log(`🖱️ 궁극적 날짜 클릭: ${day}일`);

                setTimeout(() => {
                    ultimateForceShowModal('dateMemoModal');

                    // 날짜 설정
                    const modalDay = document.getElementById('modalDay');
                    if (modalDay) modalDay.value = day;
                }, 100);
            }
        }
    }, true);

    // 설정 버튼 클릭 처리
    document.addEventListener('click', function(e) {
        if ((e.target.id === 'settingsBtn' || e.target.closest('#settingsBtn')) && e.isTrusted) {
            console.log('🖱️ 궁극적 설정 버튼 클릭');

            setTimeout(() => {
                ultimateForceShowModal('settingsModal');
            }, 100);
        }
    }, true);

    console.log('✅ 궁극적 클릭 핸들러 등록 완료');
}

// 지속적 모달 복원 시스템
function setupPersistentModalRestoration() {
    setInterval(() => {
        const dateMemoModal = document.getElementById('dateMemoModal');
        const settingsModal = document.getElementById('settingsModal');

        // dateMemoModal이 숨겨져 있으면 복원
        if (dateMemoModal && dateMemoModal.style.display === 'none') {
            console.log('🔄 dateMemoModal 자동 복원');
            ultimateForceShowModal('dateMemoModal');
        }

        // settingsModal이 숨겨져 있으면 복원
        if (settingsModal && settingsModal.style.display === 'none') {
            console.log('🔄 settingsModal 자동 복원');
            ultimateForceShowModal('settingsModal');
        }
    }, 500); // 0.5초마다 체크

    console.log('✅ 지속적 모달 복원 시스템 활성화');
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 궁극적 모달 강제 표시 시스템 초기화');

        // CSS 주입
        injectUltimateCSS();

        // 스타일 보호 설정
        setupUltimateStyleProtection();

        // 클릭 핸들러 설정
        setupUltimateClickHandlers();

        // 지속적 복원 시스템 설정
        setupPersistentModalRestoration();

        console.log('✅ 궁극적 모달 강제 표시 시스템 준비 완료');
        console.log('🖱️ 이제 날짜나 설정을 클릭하면 모달이 강제로 표시됩니다');

    }, 3000); // 다른 모든 스크립트 로드 후 실행
});

// 전역 함수
window.ultimateForceShowModal = ultimateForceShowModal;
window.testUltimateModal = function() {
    console.log('🧪 궁극적 모달 테스트');
    ultimateForceShowModal('dateMemoModal');
    ultimateForceShowModal('settingsModal');
};

console.log('✅ 궁극적 모달 강제 표시 스크립트 로드 완료');