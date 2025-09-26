/* 개선된 메뉴 UI 스크립트 */

// 개선된 메뉴 UI 초기화 - 개별 메뉴 유지
function initializeImprovedMenu() {
    console.log('개선된 메뉴 UI 초기화 중... (개별 메뉴 유지)');
    
    // 기존 메뉴 버튼들의 스타일만 개선
    improveExistingButtons();
    
    // 키보드 접근성 추가
    addKeyboardSupport();
    
    // 반응형 메뉴 처리
    handleResponsiveMenu();
    
    // 글자 가림 방지 처리
    preventTextOverlap();
    
    console.log('개선된 메뉴 UI 초기화 완료');
}

// 기존 메뉴 버튼들의 스타일만 개선 (구조 변경 없음)
function improveExistingButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        // 기존 기능은 유지하고 스타일만 개선
        if (!button.classList.contains('improved')) {
            button.classList.add('improved');
            
            // 글자가 잘리지 않도록 최소 너비 보장
            const buttonText = button.textContent.trim();
            const textLength = buttonText.length;
            
            // 텍스트 길이에 따라 최소 너비 설정
            const minWidth = Math.max(120, textLength * 8 + 60);
            button.style.minWidth = minWidth + 'px';
            
            // 툴팁 추가 (기존 title 속성이 없는 경우만)
            if (!button.getAttribute('title') && buttonText) {
                button.setAttribute('title', buttonText);
            }
        }
    });
}

// 글자 가림 방지 처리
function preventTextOverlap() {
    // 모든 텍스트 요소에 대해 가림 방지 처리
    const textElements = document.querySelectorAll('.action-btn, .nav-btn, .status-indicator');
    
    textElements.forEach(element => {
        // 텍스트 오버플로우 방지
        element.style.textOverflow = 'clip';
        element.style.overflow = 'visible';
        element.style.whiteSpace = 'nowrap';
        
        // 요소의 실제 필요한 너비 계산
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.font = window.getComputedStyle(element).font;
        tempSpan.textContent = element.textContent;
        
        document.body.appendChild(tempSpan);
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        
        // 여유 공간을 포함한 최소 너비 설정
        const requiredWidth = textWidth + 40; // 패딩 여유분
        if (element.offsetWidth < requiredWidth) {
            element.style.minWidth = requiredWidth + 'px';
        }
    });
    
    // 액션 바 레이아웃 조정
    const actionBar = document.querySelector('.action-bar');
    if (actionBar) {
        // flexbox 설정으로 요소들이 자연스럽게 배치되도록
        actionBar.style.flexWrap = 'wrap';
        actionBar.style.alignItems = 'center';
        actionBar.style.justifyContent = 'flex-start';
    }
}

// 모든 드롭다운 숨기기 (호환성 유지)
function hideAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// 키보드 접근성 추가
function addKeyboardSupport() {
    // ESC 키로 드롭다운 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllDropdowns();
        }
    });
    
    // Tab 키 네비게이션 개선
    document.querySelectorAll('.action-btn, .nav-btn').forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// 반응형 메뉴 처리
function handleResponsiveMenu() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleScreenChange(e) {
        const actionBar = document.querySelector('.action-bar');
        if (!actionBar) return;
        
        if (e.matches) {
            // 모바일 레이아웃
            actionBar.classList.add('mobile-layout');
        } else {
            // 데스크톱 레이아웃
            actionBar.classList.remove('mobile-layout');
        }
    }
    
    mediaQuery.addListener(handleScreenChange);
    handleScreenChange(mediaQuery);
}

// 버튼 상태 관리
function setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// 상태 인디케이터 업데이트 (기존 기능 유지)
function updateStatusIndicator(id, status, text, icon) {
    const indicator = document.getElementById(id);
    if (!indicator) return;
    
    // 기존 상태 클래스 제거
    indicator.classList.remove('connected', 'syncing', 'error', 'warning');
    
    // 새 상태 클래스 추가
    if (status) {
        indicator.classList.add(status);
    }
    
    // 아이콘 업데이트
    const iconElement = indicator.querySelector('.status-icon');
    if (iconElement && icon) {
        iconElement.textContent = icon;
    }
    
    // 텍스트 업데이트
    const textElement = indicator.querySelector('.status-text');
    if (textElement && text) {
        textElement.textContent = text;
    }
}

// 외부 클릭으로 드롭다운 닫기
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-menu')) {
        hideAllDropdowns();
    }
});

// 애니메이션 효과 추가
function addButtonAnimation(button, type = 'success') {
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
        
        // 성공/에러 피드백
        if (type === 'success') {
            button.style.background = 'rgba(72, 187, 120, 0.2)';
            button.style.borderColor = '#48bb78';
        } else if (type === 'error') {
            button.style.background = 'rgba(245, 101, 101, 0.2)';
            button.style.borderColor = '#f56565';
        }
        
        // 원래 스타일로 복구
        setTimeout(() => {
            button.style.background = '';
            button.style.borderColor = '';
        }, 1000);
    }, 100);
}

// 툴팁 기능 추가
function addTooltips() {
    document.querySelectorAll('[title]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const title = element.getAttribute('title');
    if (!title) return;
    
    // 기존 title 속성 임시 제거 (브라우저 기본 툴팁 방지)
    element.setAttribute('data-original-title', title);
    element.removeAttribute('title');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = title;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(45, 55, 72, 0.95);
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 9999;
        pointer-events: none;
        backdrop-filter: blur(4px);
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.bottom + 8 + 'px';
    
    element._tooltip = tooltip;
}

function hideTooltip(e) {
    const element = e.target;
    if (element._tooltip) {
        element._tooltip.remove();
        element._tooltip = null;
    }
    
    // 원래 title 속성 복구
    const originalTitle = element.getAttribute('data-original-title');
    if (originalTitle) {
        element.setAttribute('title', originalTitle);
        element.removeAttribute('data-original-title');
    }
}

// DOM 준비 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeImprovedMenu, 100);
    });
} else {
    setTimeout(initializeImprovedMenu, 100);
}

// 전역 함수로 내보내기 (기존 코드 호환성)
window.improvedMenuUI = {
    setButtonLoading,
    updateStatusIndicator,
    addButtonAnimation,
    hideAllDropdowns
};