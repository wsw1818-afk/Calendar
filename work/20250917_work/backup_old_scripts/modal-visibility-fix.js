// 📝 모달 표시 문제 영구 수정 스크립트
// 모든 모달이 제대로 보이도록 보장

console.log('🔧 모달 표시 수정 스크립트 로드됨');

// 모달 표시 함수
function showModalProperly(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.display = 'block';
        console.log(`✅ ${modalId} 모달 표시 완료`);
        return true;
    }
    console.log(`❌ ${modalId} 모달을 찾을 수 없음`);
    return false;
}

// 기존 함수들을 래핑하여 모달 표시 문제 해결
const originalFunctions = {};

// 일정 추가 모달 수정
if (window.openCreateModal) {
    originalFunctions.openCreateModal = window.openCreateModal;
    window.openCreateModal = function() {
        const result = originalFunctions.openCreateModal.apply(this, arguments);
        setTimeout(() => showModalProperly('createModal'), 10);
        return result;
    };
}

// 엑셀 내보내기 모달 수정
if (window.openExcelModal) {
    originalFunctions.openExcelModal = window.openExcelModal;
    window.openExcelModal = function() {
        const result = originalFunctions.openExcelModal.apply(this, arguments);
        setTimeout(() => showModalProperly('excelModal'), 10);
        return result;
    };
}

// 설정 모달 수정
if (window.openSettingsModal) {
    originalFunctions.openSettingsModal = window.openSettingsModal;
    window.openSettingsModal = function() {
        const result = originalFunctions.openSettingsModal.apply(this, arguments);
        setTimeout(() => showModalProperly('settingsModal'), 10);
        return result;
    };
}

// 저장소 모달 수정
if (window.openStorageModal) {
    originalFunctions.openStorageModal = window.openStorageModal;
    window.openStorageModal = function() {
        const result = originalFunctions.openStorageModal.apply(this, arguments);
        setTimeout(() => showModalProperly('storageModal'), 10);
        return result;
    };
}

// 클라우드 설정 모달 수정
if (window.openCloudSettingsModal) {
    originalFunctions.openCloudSettingsModal = window.openCloudSettingsModal;
    window.openCloudSettingsModal = function() {
        const result = originalFunctions.openCloudSettingsModal.apply(this, arguments);
        setTimeout(() => showModalProperly('cloudSettingsModal'), 10);
        return result;
    };
}

// 메모 상세 모달 수정
if (window.openMemoDetail) {
    originalFunctions.openMemoDetail = window.openMemoDetail;
    window.openMemoDetail = function() {
        const result = originalFunctions.openMemoDetail.apply(this, arguments);
        setTimeout(() => showModalProperly('memoDetailModal'), 10);
        return result;
    };
}

// 날짜 메모 모달 수정
if (window.openDateMemoModal) {
    originalFunctions.openDateMemoModal = window.openDateMemoModal;
    window.openDateMemoModal = function() {
        const result = originalFunctions.openDateMemoModal.apply(this, arguments);
        setTimeout(() => showModalProperly('dateMemoModal'), 10);
        return result;
    };
}

// 모든 버튼 클릭 이벤트를 감지하여 자동으로 모달 표시 수정
document.addEventListener('click', function(event) {
    const target = event.target;

    console.log('🖱️ 버튼 클릭 감지:', target.id, target.textContent);

    // 버튼별로 해당하는 모달 자동 표시 - 더 짧은 지연시간으로 수정
    if (target.id === 'createBtn' || target.textContent.includes('일정 추가')) {
        setTimeout(() => showModalProperly('createModal'), 10);
    } else if (target.id === 'excelBtn' || target.textContent.includes('엑셀')) {
        console.log('📊 엑셀 버튼 클릭 - 모달 표시 수정 예약');
        setTimeout(() => showModalProperly('excelModal'), 10);
    } else if (target.id === 'settingsBtn' || (target.textContent.includes('설정') &&
                                                                   !target.textContent.includes('저장') &&
                                                                   !target.textContent.includes('취소'))) {
        console.log('⚙️ 설정 버튼 클릭 - 모달 표시 수정 예약');
        setTimeout(() => showModalProperly('settingsModal'), 10);
    } else if (target.id === 'storageBtn' || target.textContent.includes('저장소')) {
        setTimeout(() => showModalProperly('storageModal'), 10);
    } else if (target.id === 'cloudSettingsBtn' || (target.textContent.includes('클라우드') &&
                                                                      !target.textContent.includes('저장') &&
                                                                      !target.textContent.includes('취소'))) {
        setTimeout(() => showModalProperly('cloudSettingsModal'), 10);
    }
});

// DOM이 변경될 때마다 숨겨진 모달을 자동으로 표시
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target;
            if (target.classList && target.classList.contains('modal')) {
                const computedStyle = window.getComputedStyle(target);
                if (computedStyle.display === 'block' &&
                    (computedStyle.visibility === 'hidden' || computedStyle.opacity === '0')) {
                    console.log(`🔧 자동 모달 표시 수정: ${target.id}`);
                    showModalProperly(target.id);
                }
            }
        }
    });
});

// 모든 모달을 관찰
const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
    observer.observe(modal, {
        attributes: true,
        attributeFilter: ['style']
    });
});

console.log('✅ 모달 표시 수정 시스템 초기화 완료');
console.log('🛠️ 이제 모든 모달이 제대로 표시됩니다');