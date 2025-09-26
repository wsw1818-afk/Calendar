/* 메뉴창(모달) 레이아웃 개선 스크립트 - 텍스트 겹침 방지 */

// 모달 레이아웃 초기화 및 개선
function initializeModalLayoutFix() {
    console.log('모달 레이아웃 개선 초기화 중...');
    
    // 모든 모달에 대해 레이아웃 개선 적용
    applyModalLayoutFix();
    
    // 모달 열기/닫기 이벤트 감지
    observeModalChanges();
    
    // 창 크기 변경 시 레이아웃 재조정
    handleWindowResize();
    
    // 텍스트 겹침 방지 처리
    preventModalTextOverlap();
    
    console.log('모달 레이아웃 개선 초기화 완료');
}

// 모든 모달에 레이아웃 개선 적용
function applyModalLayoutFix() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const modalContent = modal.querySelector('.modal-content');
        const modalHeader = modal.querySelector('.modal-header');
        const modalTitle = modal.querySelector('.modal-title');
        const modalClose = modal.querySelector('.modal-close');
        const modalBody = modal.querySelector('.modal-body');
        
        if (!modal.classList.contains('layout-fixed')) {
            modal.classList.add('layout-fixed');
            
            // 모달 헤더 레이아웃 개선
            if (modalHeader && modalTitle && modalClose) {
                fixModalHeaderLayout(modalHeader, modalTitle, modalClose);
            }
            
            // 모달 바디 내용 정리
            if (modalBody) {
                fixModalBodyLayout(modalBody);
            }
            
            // 모달 크기 자동 조정
            if (modalContent) {
                adjustModalSize(modalContent);
            }
        }
    });
}

// 모달 헤더 레이아웃 개선
function fixModalHeaderLayout(header, title, closeBtn) {
    // 헤더를 flexbox로 설정 (이미 CSS에서 설정되어 있지만 확실히 하기 위해)
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.position = 'relative';
    
    // 제목 영역 설정
    title.style.flex = '1';
    title.style.paddingRight = '60px'; // 닫기 버튼 공간 확보
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    title.style.whiteSpace = 'nowrap';
    title.style.maxWidth = 'calc(100% - 80px)';
    
    // 닫기 버튼 위치 고정
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '20px';
    closeBtn.style.top = '50%';
    closeBtn.style.transform = 'translateY(-50%)';
    closeBtn.style.flexShrink = '0';
    closeBtn.style.zIndex = '10';
}

// 모달 바디 레이아웃 개선
function fixModalBodyLayout(body) {
    const formGroups = body.querySelectorAll('.form-group');
    const buttons = body.querySelectorAll('button, .btn');
    const tabs = body.querySelectorAll('.tab-menu, .backup-menu-tabs');
    
    // 폼 그룹 간격 조정
    formGroups.forEach((group, index) => {
        group.style.marginBottom = '20px';
        group.style.clear = 'both';
        group.style.position = 'relative';
        
        // 라벨과 입력 필드 간격 조정
        const label = group.querySelector('.form-label, label');
        const input = group.querySelector('.form-input, .form-select, .form-textarea, input, select, textarea');
        
        if (label && input) {
            label.style.display = 'block';
            label.style.marginBottom = '8px';
            label.style.wordWrap = 'break-word';
            label.style.overflowWrap = 'break-word';
            
            input.style.width = '100%';
            input.style.boxSizing = 'border-box';
        }
    });
    
    // 버튼 그룹 정리
    organizeButtonGroups(body);
    
    // 탭 메뉴 정리
    tabs.forEach(tab => {
        fixTabLayout(tab);
    });
}

// 버튼 그룹 정리
function organizeButtonGroups(container) {
    const buttons = container.querySelectorAll('button:not(.modal-close):not(.tab-item)');
    
    if (buttons.length > 1) {
        // 연속된 버튼들을 찾아서 그룹화
        let currentGroup = [];
        let groups = [];
        
        buttons.forEach((button, index) => {
            const nextButton = buttons[index + 1];
            const buttonRect = button.getBoundingClientRect();
            
            if (nextButton) {
                const nextRect = nextButton.getBoundingClientRect();
                const verticalDistance = Math.abs(nextRect.top - buttonRect.bottom);
                
                // 버튼들이 가까이 있으면 같은 그룹으로 처리
                if (verticalDistance < 50) {
                    currentGroup.push(button);
                } else {
                    currentGroup.push(button);
                    groups.push([...currentGroup]);
                    currentGroup = [];
                }
            } else {
                currentGroup.push(button);
                if (currentGroup.length > 0) {
                    groups.push([...currentGroup]);
                }
            }
        });
        
        // 각 그룹에 대해 레이아웃 적용
        groups.forEach(group => {
            if (group.length > 1) {
                createButtonGroup(group);
            }
        });
    }
}

// 버튼 그룹 생성
function createButtonGroup(buttons) {
    const firstButton = buttons[0];
    const parent = firstButton.parentNode;
    
    // 버튼 그룹 컨테이너 생성
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group modal-button-group';
    buttonGroup.style.cssText = `
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid rgba(99, 132, 183, 0.1);
        justify-content: flex-end;
        flex-wrap: wrap;
    `;
    
    // 첫 번째 버튼 위치에 그룹 컨테이너 삽입
    parent.insertBefore(buttonGroup, firstButton);
    
    // 모든 버튼을 그룹 컨테이너로 이동
    buttons.forEach(button => {
        button.style.minWidth = '100px';
        button.style.minHeight = '44px';
        button.style.whiteSpace = 'nowrap';
        button.style.flexShrink = '0';
        buttonGroup.appendChild(button);
    });
}

// 탭 레이아웃 개선
function fixTabLayout(tabContainer) {
    tabContainer.style.display = 'flex';
    tabContainer.style.overflowX = 'auto';
    tabContainer.style.overflowY = 'hidden';
    tabContainer.style.borderBottom = '2px solid rgba(99, 132, 183, 0.1)';
    tabContainer.style.marginBottom = '20px';
    
    const tabs = tabContainer.querySelectorAll('.tab-item, [class*="tab"]');
    tabs.forEach(tab => {
        tab.style.flexShrink = '0';
        tab.style.whiteSpace = 'nowrap';
        tab.style.minWidth = 'fit-content';
        tab.style.padding = '12px 20px';
    });
}

// 모달 크기 자동 조정
function adjustModalSize(modalContent) {
    const modal = modalContent.closest('.modal');
    if (!modal) return;
    
    // 모달이 화면을 벗어나지 않도록 조정
    const rect = modalContent.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (rect.height > viewportHeight * 0.9) {
        modalContent.style.maxHeight = '90vh';
        const modalBody = modalContent.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.overflowY = 'auto';
            modalBody.style.maxHeight = 'calc(90vh - 140px)';
        }
    }
    
    if (rect.width > viewportWidth * 0.95) {
        modalContent.style.width = '95%';
        modalContent.style.maxWidth = 'none';
    }
}

// 텍스트 겹침 방지 처리
function preventModalTextOverlap() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const textElements = modal.querySelectorAll('label, .form-label, .modal-title, button, .btn, .tab-item');
        
        textElements.forEach(element => {
            // 텍스트가 길어서 잘릴 가능성이 있는 요소들 처리
            const text = element.textContent || element.innerText;
            if (text && text.length > 15) {
                element.style.wordWrap = 'break-word';
                element.style.overflowWrap = 'break-word';
                element.style.lineHeight = '1.4';
                
                // 버튼의 경우 최소 너비 보장
                if (element.tagName === 'BUTTON' || element.classList.contains('btn')) {
                    const minWidth = Math.max(100, text.length * 8 + 40);
                    element.style.minWidth = minWidth + 'px';
                }
            }
        });
    });
}

// 모달 변경 사항 감지
function observeModalChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList.contains('modal')) {
                    // 모달이 열렸을 때 레이아웃 개선 적용
                    if (target.style.display === 'block' || target.style.display === 'flex') {
                        setTimeout(() => {
                            applyModalLayoutFix();
                            preventModalTextOverlap();
                        }, 100);
                    }
                }
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    });
}

// 창 크기 변경 시 레이아웃 재조정
function handleWindowResize() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const visibleModals = document.querySelectorAll('.modal[style*="display: block"], .modal[style*="display: flex"]');
            visibleModals.forEach(modal => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    adjustModalSize(modalContent);
                }
            });
        }, 250);
    });
}

// 모달 열기 이벤트 감지 및 레이아웃 적용
function enhanceModalOpenEvents() {
    // 기존 모달 열기 함수들을 감지하여 레이아웃 개선 적용
    const originalShowModal = window.showModal;
    const originalOpenModal = window.openModal;
    
    if (typeof originalShowModal === 'function') {
        window.showModal = function(modalId) {
            const result = originalShowModal.apply(this, arguments);
            setTimeout(() => {
                applyModalLayoutFix();
                preventModalTextOverlap();
            }, 100);
            return result;
        };
    }
    
    if (typeof originalOpenModal === 'function') {
        window.openModal = function(modalId) {
            const result = originalOpenModal.apply(this, arguments);
            setTimeout(() => {
                applyModalLayoutFix();
                preventModalTextOverlap();
            }, 100);
            return result;
        };
    }
}

// DOM 준비 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeModalLayoutFix, 200);
        enhanceModalOpenEvents();
    });
} else {
    setTimeout(initializeModalLayoutFix, 200);
    enhanceModalOpenEvents();
}

// 전역 함수로 내보내기 (기존 코드 호환성)
window.modalLayoutFix = {
    applyModalLayoutFix,
    preventModalTextOverlap,
    adjustModalSize
};