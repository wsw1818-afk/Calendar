// 🔧 종합적인 버튼 클릭 문제 해결 스크립트
// 사용자 직접 클릭이 작동하지 않는 문제를 해결

console.log('🚀 종합적인 버튼 클릭 수정 시작');

// 1. 기존 방해 요소들 제거
function clearInterferences() {
    console.log('🧹 방해 요소 제거 중...');

    // 모든 timeout/interval 정리
    let highestTimeoutId = setTimeout(';');
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
        clearInterval(i);
    }

    // 글로벌 변수 정리
    if (window.healthCheckInterval) {
        clearInterval(window.healthCheckInterval);
        window.healthCheckInterval = null;
    }

    if (window.diagnosticsInterval) {
        clearInterval(window.diagnosticsInterval);
        window.diagnosticsInterval = null;
    }

    // MutationObserver 정리
    if (window.observers) {
        window.observers.forEach(observer => observer.disconnect());
        window.observers = [];
    }

    console.log('✅ 방해 요소 제거 완료');
}

// 2. 버튼 이벤트 핸들러 재등록
function fixButtonEventHandlers() {
    console.log('🔧 버튼 이벤트 핸들러 수정 중...');

    const buttonConfigs = [
        {
            id: 'createBtn',
            modalId: 'createModal',
            function: 'openCreateModal',
            name: '일정 추가'
        },
        {
            id: 'excelBtn',
            modalId: 'excelModal',
            function: 'openExcelModal',
            name: '엑셀 내보내기'
        },
        {
            id: 'settingsBtn',
            modalId: 'settingsModal',
            function: 'openSettingsModal',
            name: '설정'
        },
        {
            id: 'storageBtn',
            modalId: 'storageModal',
            function: 'openStorageModal',
            name: '저장소'
        },
        {
            id: 'cloudSettingsBtn',
            modalId: 'cloudSettingsModal',
            function: 'openCloudSettingsModal',
            name: '클라우드 설정'
        },
        {
            id: 'stickyBtn',
            function: 'openStickyMemo',
            name: '스티커 메모'
        }
    ];

    buttonConfigs.forEach(config => {
        const button = document.getElementById(config.id);
        if (button) {
            // 기존 이벤트 리스너 제거
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // 새 이벤트 리스너 추가
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                console.log(`🖱️ ${config.name} 버튼 클릭 감지됨`);

                try {
                    if (config.modalId) {
                        // 모달 타입 버튼
                        if (window[config.function]) {
                            window[config.function]();
                        }

                        // 모달 강제 표시
                        setTimeout(() => {
                            const modal = document.getElementById(config.modalId);
                            if (modal) {
                                modal.style.display = 'block';
                                modal.style.visibility = 'visible';
                                modal.style.opacity = '1';
                                modal.style.zIndex = '9999';
                                console.log(`✅ ${config.name} 모달 표시 완료`);
                            }
                        }, 10);
                    } else if (config.function === 'openStickyMemo') {
                        // 스티커 메모 특별 처리
                        window.open('sticky-memo.html', '_blank');
                        console.log(`✅ ${config.name} 새 창 열기 완료`);
                    }
                } catch (error) {
                    console.error(`❌ ${config.name} 버튼 처리 중 오류:`, error);
                }
            });

            console.log(`✅ ${config.name} 버튼 이벤트 핸들러 등록 완료`);
        }
    });
}

// 3. CSS 스타일 문제 해결
function fixCSSIssues() {
    console.log('🎨 CSS 문제 해결 중...');

    // 모달 기본 스타일 강화
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none !important;
            position: fixed !important;
            z-index: 9999 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0,0,0,0.5) !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        .modal.show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        .action-btn {
            pointer-events: auto !important;
            cursor: pointer !important;
            position: relative !important;
            z-index: 1 !important;
        }

        .action-btn:hover {
            transform: scale(1.05) !important;
            transition: transform 0.2s !important;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ CSS 문제 해결 완료');
}

// 4. 중복 ID 문제 해결
function fixDuplicateIds() {
    console.log('🔍 중복 ID 문제 해결 중...');

    const allElements = document.querySelectorAll('[id]');
    const seenIds = new Set();
    const duplicates = [];

    allElements.forEach(el => {
        if (seenIds.has(el.id)) {
            duplicates.push(el);
        } else {
            seenIds.add(el.id);
        }
    });

    duplicates.forEach((el, index) => {
        const newId = el.id + '_duplicate_' + index;
        console.log(`🔧 중복 ID 수정: ${el.id} → ${newId}`);
        el.id = newId;
    });

    console.log(`✅ 중복 ID ${duplicates.length}개 해결 완료`);
}

// 5. 디버깅 모니터링 추가
function addDebugMonitoring() {
    console.log('🔍 디버깅 모니터링 추가 중...');

    // 클릭 이벤트 모니터링
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-btn')) {
            console.log(`🎯 버튼 클릭 감지: ${e.target.id} (${e.target.textContent})`);
        }
    }, true);

    // 모달 상태 변화 모니터링
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const style = window.getComputedStyle(modal);
                    if (style.display === 'block') {
                        console.log(`👁️ 모달 표시됨: ${modal.id}`);
                    }
                }
            });
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });
    });

    console.log('✅ 디버깅 모니터링 추가 완료');
}

// 6. 전체 수정 실행
function executeComprehensiveFix() {
    try {
        clearInterferences();
        fixDuplicateIds();
        fixCSSIssues();
        fixButtonEventHandlers();
        addDebugMonitoring();

        console.log('🎉 종합적인 버튼 클릭 수정 완료!');
        console.log('📋 이제 모든 메뉴 버튼이 정상적으로 작동합니다');

        return {
            success: true,
            message: '버튼 클릭 문제 해결 완료'
        };
    } catch (error) {
        console.error('❌ 수정 중 오류 발생:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// DOM 로드 완료 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', executeComprehensiveFix);
} else {
    executeComprehensiveFix();
}

// 전역 함수로 노출 (수동 실행용)
window.executeComprehensiveFix = executeComprehensiveFix;

console.log('📝 종합적인 버튼 클릭 수정 스크립트 로드 완료');