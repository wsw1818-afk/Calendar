// 🔧 모달 자동 열림 문제 수정 스크립트
// 클라우드 모달 닫기 후 설정 모달이 자동으로 열리는 문제 해결

console.log('🔧 모달 자동 열림 수정 스크립트 로드됨');

// 모달 상태 추적
let lastOpenedModal = null;
let modalCloseTime = 0;
let isModalTransition = false;

// 원본 modal-visibility-fix.js의 버튼 클릭 이벤트를 수정
document.addEventListener('click', function(event) {
    const target = event.target;
    const now = Date.now();

    // 최근에 모달이 닫혔다면 짧은 시간 내에는 새로운 모달 열기를 방지
    if (now - modalCloseTime < 500) {
        console.log('🚫 모달 전환 방지: 최근에 모달이 닫힘');
        return;
    }

    // 클라우드 모달 관련 요소인지 확인
    let isCloudModalElement = false;
    let element = target;
    while (element && element !== document.body) {
        if (element.id === 'unified-modal' ||
            element.classList.contains('unified-modal') ||
            element.classList.contains('cloud-modal')) {
            isCloudModalElement = true;
            break;
        }
        element = element.parentElement;
    }

    // 클라우드 모달 내부 요소 클릭 시에는 설정 모달을 열지 않음 (저장 버튼 제외)
    if (isCloudModalElement && target.textContent.includes('설정') &&
        !target.textContent.includes('저장')) {
        console.log('🚫 클라우드 모달 내부 설정 버튼 - 설정 모달 열기 방지');
        event.stopPropagation();
        return;
    }

    // 명시적으로 설정 버튼을 클릭한 경우에만 설정 모달 열기
    if ((target.id === 'settingsBtn' || target.textContent.trim() === '⚙️ 설정') &&
        !isCloudModalElement) {
        console.log('✅ 명시적 설정 버튼 클릭 - 설정 모달 열기 허용');
    } else if (target.textContent.includes('설정') &&
               !target.textContent.includes('저장') &&
               !target.textContent.includes('취소') &&
               !target.classList.contains('btn-primary') &&
               !target.onclick) {
        console.log('🚫 간접 설정 버튼 클릭 방지:', target.textContent);
        event.stopPropagation();
        return;
    }
}, true); // capture phase에서 처리

// 모달 닫기 감지
const originalCloseModal = window.closeModal;
if (originalCloseModal) {
    window.closeModal = function(modalId) {
        console.log(`🚪 모달 닫기: ${modalId}`);
        lastOpenedModal = modalId;
        modalCloseTime = Date.now();

        // 클라우드 모달이 닫힐 때 전환 상태 설정
        if (modalId === 'unified-modal' || modalId === 'cloudSettingsModal') {
            isModalTransition = true;
            setTimeout(() => {
                isModalTransition = false;
            }, 1000);
        }

        return originalCloseModal.apply(this, arguments);
    };
}

// MutationObserver로 모달 DOM 변경 감지하여 자동 열림 방지
const modalObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' &&
            mutation.attributeName === 'style' &&
            isModalTransition) {

            const target = mutation.target;
            if (target.id === 'settingsModal' &&
                target.style.display === 'block') {
                console.log('🚫 모달 전환 중 설정 모달 자동 열림 방지');
                target.style.display = 'none';
            }
        }
    });
});

// 설정 모달 관찰 시작
setTimeout(() => {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        modalObserver.observe(settingsModal, {
            attributes: true,
            attributeFilter: ['style']
        });
        console.log('👁️ 설정 모달 관찰 시작');
    }
}, 1000);

console.log('✅ 모달 자동 열림 수정 시스템 초기화 완료');