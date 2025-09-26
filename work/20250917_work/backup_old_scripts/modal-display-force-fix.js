// 🔧 모달 강제 표시 및 숨김 방지 스크립트
console.log('🔧 모달 강제 표시 및 숨김 방지 시작');

// 설정 모달 강제 표시 함수
function forceShowSettingsModal() {
    console.log('⚙️ 설정 모달 강제 표시 시도');

    const modal = document.getElementById('settingsModal');
    if (!modal) {
        console.log('❌ settingsModal 요소를 찾을 수 없음');
        return false;
    }

    // 메인 모달 컨테이너 강제 표시
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '999999';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
    modal.style.pointerEvents = 'auto';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    // 모달 콘텐츠 찾기 및 표시
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.display = 'block';
        modalContent.style.visibility = 'visible';
        modalContent.style.opacity = '1';
        modalContent.style.position = 'relative';
        modalContent.style.background = 'white';
        modalContent.style.borderRadius = '12px';
        modalContent.style.padding = '25px';
        modalContent.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.transform = 'none';
        modalContent.style.zIndex = '1000000';

        // 문제가 되는 클래스들 제거
        modalContent.classList.remove('ultimate-hidden');
        modalContent.removeAttribute('aria-hidden');
        modalContent.removeAttribute('data-cleanup-processed');
    }

    // 모달 헤더, 바디 등 하위 요소들 강제 표시
    const modalElements = modal.querySelectorAll('.modal-header, .modal-body, .modal-footer, .modal-title, .modal-close');
    modalElements.forEach(element => {
        element.style.display = element.classList.contains('modal-close') ? 'inline-block' : 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.classList.remove('ultimate-hidden');
        element.removeAttribute('aria-hidden');
    });

    // 문제가 되는 속성들 제거
    modal.classList.remove('ultimate-hidden');
    modal.removeAttribute('aria-hidden');
    modal.removeAttribute('data-cleanup-processed');

    console.log('✅ 설정 모달 강제 표시 완료');
    return true;
}

// MutationObserver로 모달이 숨겨지는 것을 감지하고 다시 표시
let modalObserver = null;

function startModalProtection() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    if (modalObserver) {
        modalObserver.disconnect();
    }

    modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
                const target = mutation.target;

                // 모달이나 모달 콘텐츠가 숨겨지려고 하면 다시 표시
                if (target.id === 'settingsModal' || target.classList.contains('modal-content')) {
                    const computedStyle = window.getComputedStyle(target);

                    if (computedStyle.display === 'none' ||
                        computedStyle.visibility === 'hidden' ||
                        computedStyle.opacity === '0') {

                        console.log('🛡️ 모달이 숨겨지려 함 - 다시 표시');
                        setTimeout(() => forceShowSettingsModal(), 10);
                    }
                }
            }
        });
    });

    modalObserver.observe(modal, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style', 'class', 'aria-hidden']
    });

    console.log('🛡️ 모달 보호 시스템 시작됨');
}

// 설정 버튼 클릭 이벤트 재정의
function setupSettingsButtonHandler() {
    const settingsBtn = document.getElementById('settingsBtn');
    if (!settingsBtn) {
        console.log('❌ 설정 버튼을 찾을 수 없음');
        return;
    }

    // 기존 이벤트 리스너들 제거
    const newSettingsBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

    // 새로운 클릭 이벤트 등록
    newSettingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('⚙️ 설정 버튼 클릭됨 - 강제 표시 시작');

        // 다른 스크립트들이 실행되기 전에 즉시 표시
        forceShowSettingsModal();

        // 보호 시스템 시작
        startModalProtection();

        return false;
    }, true);

    console.log('✅ 설정 버튼 핸들러 재설정 완료');
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('settingsModal');
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            if (modalObserver) {
                modalObserver.disconnect();
                modalObserver = null;
            }
            console.log('🔑 ESC로 모달 닫기');
        }
    }
});

// 모달 배경 클릭으로 닫기
document.addEventListener('click', function(e) {
    const modal = document.getElementById('settingsModal');
    if (modal && e.target === modal) {
        modal.style.display = 'none';
        if (modalObserver) {
            modalObserver.disconnect();
            modalObserver = null;
        }
        console.log('🖱️ 배경 클릭으로 모달 닫기');
    }
});

// DOM 로드 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(setupSettingsButtonHandler, 1000);
    });
} else {
    setTimeout(setupSettingsButtonHandler, 100);
}

console.log('✅ 모달 강제 표시 및 숨김 방지 스크립트 로드 완료');

// 전역 함수로 노출
window.forceShowSettingsModal = forceShowSettingsModal;