// 🎯 사용자 클릭시 자동 모달 표시 완전 해결 스크립트
console.log('🚀 자동 모달 표시 시스템 시작');

// 모달을 자동으로 표시하는 함수
function autoShowModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 모든 스타일을 강제로 설정
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '99999';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';

        // 클래스도 추가
        modal.classList.add('show');

        console.log(`✅ ${modalId} 자동 표시 완료`);
        return true;
    }
    console.log(`❌ ${modalId} 모달을 찾을 수 없음`);
    return false;
}

// 버튼과 모달 연결 설정
const buttonModalMap = {
    'createBtn': 'createModal',
    'excelBtn': 'excelModal',
    'settingsBtn': 'settingsModal',
    'storageBtn': 'storageModal',
    'cloudSettingsBtn': 'cloudSettingsModal'
};

// 각 버튼에 새로운 클릭 이벤트 추가
Object.entries(buttonModalMap).forEach(([buttonId, modalId]) => {
    const button = document.getElementById(buttonId);
    if (button) {
        // 기존 이벤트 리스너는 유지하고 추가로 모달 표시 기능 추가
        button.addEventListener('click', function(e) {
            console.log(`🖱️ ${buttonId} 클릭 감지됨 - 자동 모달 표시 시작`);

            // 약간의 지연 후 모달 표시 (기존 로직이 실행된 후)
            setTimeout(() => {
                autoShowModal(modalId);
            }, 100);
        }, true); // capture 단계에서 실행

        console.log(`🔗 ${buttonId} 자동 모달 표시 이벤트 추가 완료`);
    }
});

// 스티커 버튼은 별도 처리
const stickyBtn = document.getElementById('stickyBtn');
if (stickyBtn) {
    stickyBtn.addEventListener('click', function(e) {
        console.log('🖱️ 스티커 버튼 클릭 감지됨 - 새 창 열기');
        setTimeout(() => {
            window.open('sticky-memo.html', '_blank');
        }, 10);
    }, true);
    console.log('🔗 스티커 버튼 자동 처리 이벤트 추가 완료');
}

// 전역 함수로도 노출
window.autoShowModal = autoShowModal;

// CSS 강화 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .modal.show {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 99999 !important;
    }

    .modal {
        pointer-events: auto !important;
    }
`;
document.head.appendChild(style);

console.log('✅ 자동 모달 표시 시스템 초기화 완료');
console.log('🎯 이제 모든 메뉴 버튼 클릭시 자동으로 모달이 표시됩니다!');