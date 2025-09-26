// 🚨 모달 표시 긴급 수정 스크립트
console.log('🚨 모달 표시 긴급 수정 시작');

// 모든 ultimate-hidden 클래스 제거
function removeAllHiddenClasses() {
    const hiddenElements = document.querySelectorAll('.ultimate-hidden');
    console.log(`🔧 ultimate-hidden 클래스 제거 시작: ${hiddenElements.length}개`);

    hiddenElements.forEach((el, index) => {
        el.classList.remove('ultimate-hidden');
        console.log(`✅ ${index + 1}. ${el.tagName}.${el.className} - ultimate-hidden 제거됨`);
    });
}

// 모달 강제 표시 함수
function forceShowModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.log(`❌ 모달 ${modalId} 찾을 수 없음`);
        return false;
    }

    // 모든 숨김 클래스 제거
    modal.classList.remove('ultimate-hidden', 'hidden');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '9999';

    console.log(`✅ ${modalId} 모달 강제 표시 완료`);
    return true;
}

// 날짜 메모 모달 강제 표시
function forceShowDateMemoModal() {
    console.log('📅 날짜 메모 모달 강제 표시 시작');
    removeAllHiddenClasses();
    forceShowModal('dateMemoModal');

    // 모달 내용도 강제 표시
    const modalContent = document.querySelector('#dateMemoModal .modal-content');
    if (modalContent) {
        modalContent.style.display = 'block';
        modalContent.classList.remove('ultimate-hidden');
    }
}

// 설정 모달 강제 표시
function forceShowSettingsModal() {
    console.log('⚙️ 설정 모달 강제 표시 시작');
    removeAllHiddenClasses();
    forceShowModal('settingsModal');
}

// 모든 모달 정상화
function normalizeAllModals() {
    console.log('🔧 모든 모달 정상화 시작');

    removeAllHiddenClasses();

    // 기본 모달들 숨김
    const modals = ['dateMemoModal', 'settingsModal', 'memoDetailModal', 'createModal', 'excelModal', 'storageModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.classList.remove('ultimate-hidden');
            console.log(`✅ ${modalId} 정상화 완료`);
        }
    });
}

// 원본 함수들 재정의
function openDateMemoModal(year, month, day) {
    console.log(`📅 날짜 모달 열기: ${year}-${month}-${day}`);
    normalizeAllModals();

    const modal = document.getElementById('dateMemoModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '9999';

        // 날짜 설정
        document.getElementById('modalYear').value = year;
        document.getElementById('modalMonth').value = month;
        document.getElementById('modalDay').value = day;

        // 해당 날짜의 메모들 로드
        if (typeof displayDateMemos === 'function') {
            displayDateMemos(year, month, day);
        }

        console.log('✅ 날짜 메모 모달 열기 완료');
        return true;
    }
    return false;
}

// 설정 모달 열기 재정의
function openSettingsModal() {
    console.log('⚙️ 설정 모달 열기');
    normalizeAllModals();

    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '9999';

        console.log('✅ 설정 모달 열기 완료');
        return true;
    }
    return false;
}

// 모달 닫기 함수
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log(`✅ ${modalId} 모달 닫기 완료`);
    }
}

// 전역 함수로 등록
window.forceShowDateMemoModal = forceShowDateMemoModal;
window.forceShowSettingsModal = forceShowSettingsModal;
window.normalizeAllModals = normalizeAllModals;
window.removeAllHiddenClasses = removeAllHiddenClasses;
window.openDateMemoModal = openDateMemoModal;
window.openSettingsModal = openSettingsModal;
window.closeModal = closeModal;

// 날짜 클릭 이벤트 재등록
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 날짜 클릭 이벤트 재등록');

    // 기존 이벤트 리스너 제거하고 새로 등록
    document.querySelectorAll('.day').forEach(dayElement => {
        dayElement.removeEventListener('click', handleDayClick);
        dayElement.addEventListener('click', handleDayClick);
    });

    // 설정 버튼 이벤트 재등록
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.removeEventListener('click', handleSettingsClick);
        settingsBtn.addEventListener('click', handleSettingsClick);
    }
});

function handleDayClick(event) {
    const dayText = event.target.textContent.trim();
    const day = parseInt(dayText);

    if (!isNaN(day)) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        console.log(`📅 날짜 클릭 감지: ${year}-${month}-${day}`);
        openDateMemoModal(year, month, day);
    }
}

function handleSettingsClick(event) {
    event.preventDefault();
    console.log('⚙️ 설정 버튼 클릭 감지');
    openSettingsModal();
}

// 초기 정상화 실행
setTimeout(() => {
    normalizeAllModals();
    console.log('✅ 모달 표시 긴급 수정 완료');
}, 1000);