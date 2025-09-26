// 🔧 설정 모달 중복 섹션 제거 및 정리 시스템
console.log('🔧 설정 모달 중복 제거 시스템 로드됨');

// 설정 모달 중복 제거 함수
function cleanupDuplicateSettings() {
    console.log('🧹 설정 모달 중복 섹션 정리 시작');

    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        console.log('❌ 설정 모달을 찾을 수 없음');
        return;
    }

    // 중복 섹션들 찾기
    const sections = {
        notification: [],
        alarmTest: [],
        diagnostics: []
    };

    // 데스크탑 알림 섹션들 찾기
    const notificationHeaders = settingsModal.querySelectorAll('h3');
    notificationHeaders.forEach(header => {
        if (header.textContent.includes('데스크탑 알림')) {
            sections.notification.push(header.closest('div'));
            console.log('🔍 데스크탑 알림 섹션 발견:', header.textContent);
        }
        if (header.textContent.includes('알람 테스트')) {
            sections.alarmTest.push(header.closest('div'));
            console.log('🔍 알람 테스트 섹션 발견:', header.textContent);
        }
        if (header.textContent.includes('알림 진단')) {
            sections.diagnostics.push(header.closest('div'));
            console.log('🔍 알림 진단 섹션 발견:', header.textContent);
        }
    });

    // 중복 섹션 제거 (첫 번째만 남기고 나머지 제거)
    function removeDuplicates(sectionArray, sectionName) {
        if (sectionArray.length > 1) {
            console.log(`🗑️ ${sectionName} 중복 섹션 ${sectionArray.length - 1}개 제거`);
            for (let i = 1; i < sectionArray.length; i++) {
                if (sectionArray[i] && sectionArray[i].parentNode) {
                    sectionArray[i].remove();
                    console.log(`✅ ${sectionName} 중복 섹션 ${i}번째 제거됨`);
                }
            }
        }
    }

    removeDuplicates(sections.notification, '데스크탑 알림');
    removeDuplicates(sections.alarmTest, '알람 테스트');
    removeDuplicates(sections.diagnostics, '알림 진단');

    // ID 중복 해결
    cleanupDuplicateIds(settingsModal);

    console.log('✅ 설정 모달 중복 섹션 정리 완료');
}

// ID 중복 제거 함수
function cleanupDuplicateIds(container) {
    console.log('🔍 중복 ID 검사 및 정리 시작');

    const idMap = new Map();
    const elementsWithIds = container.querySelectorAll('[id]');

    elementsWithIds.forEach((element, index) => {
        const originalId = element.id;
        if (idMap.has(originalId)) {
            const newId = `${originalId}_${Date.now()}_${index}`;
            element.id = newId;
            console.log(`🔧 중복 ID 수정: ${originalId} → ${newId}`);
        } else {
            idMap.set(originalId, element);
        }
    });

    console.log('✅ 중복 ID 정리 완료');
}

// 설정 모달 열림 감지 및 자동 정리
function setupSettingsModalObserver() {
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        setTimeout(setupSettingsModalObserver, 100);
        return;
    }

    const settingsObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const display = settingsModal.style.display;
                if (display === 'flex' || display === 'block') {
                    console.log('🔍 설정 모달 열림 감지 - 중복 정리 실행');
                    setTimeout(cleanupDuplicateSettings, 50);
                }
            }
        });
    });

    settingsObserver.observe(settingsModal, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    console.log('👁️ 설정 모달 관찰자 설정 완료');
}

// 설정 버튼 클릭 이벤트 가로채기
function interceptSettingsButton() {
    const settingsBtn = document.getElementById('settingsBtn');
    if (!settingsBtn) {
        setTimeout(interceptSettingsButton, 100);
        return;
    }

    // 기존 이벤트 리스너 제거하고 새로 추가
    const newSettingsBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

    newSettingsBtn.addEventListener('click', function(e) {
        console.log('⚙️ 설정 버튼 클릭 - 안전한 모달 열기');

        // 기존 설정 모달 열기 로직 실행
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'flex';

            // 중복 정리 실행
            setTimeout(cleanupDuplicateSettings, 100);
        }
    });

    console.log('✅ 설정 버튼 이벤트 가로채기 완료');
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 500);
    });
} else {
    setTimeout(init, 500);
}

function init() {
    console.log('🚀 설정 모달 중복 제거 시스템 초기화');

    // 현재 열린 설정 모달이 있다면 즉시 정리
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal && settingsModal.style.display === 'flex') {
        cleanupDuplicateSettings();
    }

    // 설정 모달 관찰자 설정
    setupSettingsModalObserver();

    // 설정 버튼 이벤트 가로채기
    interceptSettingsButton();

    // 디버깅 도구 추가
    window.cleanupSettings = cleanupDuplicateSettings;
    window.debugSettingsModal = function() {
        const modal = document.getElementById('settingsModal');
        console.log('🔍 설정 모달 디버그 정보:', {
            exists: !!modal,
            display: modal?.style.display,
            sections: modal?.querySelectorAll('h3').length,
            duplicateNotifications: modal?.querySelectorAll('h3').length > 0 ?
                Array.from(modal.querySelectorAll('h3')).filter(h => h.textContent.includes('데스크탑 알림')).length : 0
        });
    };

    console.log('✅ 설정 모달 중복 제거 시스템 초기화 완료');
    console.log('🛠️ 디버깅: cleanupSettings(), debugSettingsModal()');
}

// 전역 정리 함수
window.fixSettingsModal = cleanupDuplicateSettings;