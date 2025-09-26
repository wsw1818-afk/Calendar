/* 클라우드 UI 인터랙션 및 애니메이션 스크립트 */

// 클라우드 UI 초기화
function initializeCloudUI() {
    console.log('클라우드 UI 스타일 초기화 중...');
    
    // 모든 모달에 클라우드 스타일 적용
    applyCloudStyling();
    
    // 머티리얼 리플 효과 추가
    addMaterialRipples();
    
    // 부드러운 애니메이션 추가
    addSmoothAnimations();
    
    // 키보드 내비게이션 개선
    enhanceKeyboardNavigation();
    
    // 로딩 상태 처리
    addLoadingStates();
    
    // 포커스 관리 개선
    improveFocusManagement();
    
    console.log('클라우드 UI 스타일 초기화 완료');
}

// 모든 모달에 클라우드 스타일 적용
function applyCloudStyling() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        if (!modal.classList.contains('cloud-styled')) {
            modal.classList.add('cloud-styled');
            
            // 모달 제목에 아이콘 추가
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle && !modalTitle.querySelector('.title-icon')) {
                enhanceModalTitle(modalTitle);
            }
            
            // 버튼에 리플 효과 적용
            const buttons = modal.querySelectorAll('.btn-primary, .btn-secondary');
            buttons.forEach(button => {
                if (!button.classList.contains('ripple-enabled')) {
                    addRippleEffect(button);
                }
            });
            
            // 입력 필드에 포커스 효과 적용
            const inputs = modal.querySelectorAll('.form-input, .form-select, .form-textarea');
            inputs.forEach(input => {
                enhanceInputField(input);
            });
            
            // 체크박스와 라디오에 머티리얼 스타일 적용
            const checkboxes = modal.querySelectorAll('input[type="checkbox"], input[type="radio"]');
            checkboxes.forEach(checkbox => {
                enhanceCheckboxRadio(checkbox);
            });
        }
    });
}

// 모달 제목 개선
function enhanceModalTitle(titleElement) {
    // 기존 텍스트 저장
    const originalText = titleElement.textContent;
    
    // 제목별 아이콘 매핑
    const iconMap = {
        '엑셀 내보내기': '📊',
        '설정': '⚙️',
        '일정 추가': '➕',
        '새 일정 생성': '📅',
        '클라우드 설정': '☁️',
        '동기화 상태': '🔄',
        '저장소': '🗄️'
    };
    
    // 아이콘 찾기
    let icon = '🔧'; // 기본 아이콘
    for (const [keyword, iconEmoji] of Object.entries(iconMap)) {
        if (originalText.includes(keyword)) {
            icon = iconEmoji;
            break;
        }
    }
    
    // 제목 구조 재구성
    titleElement.innerHTML = `
        <span class="title-icon">${icon}</span>
        <span class="title-text">${originalText.replace(/^[📊⚙️➕📅☁️🔄🗄️]\s*/, '')}</span>
    `;
    
    titleElement.classList.add('enhanced-title');
}

// 리플 효과 추가
function addRippleEffect(element) {
    element.classList.add('ripple-enabled');
    
    element.addEventListener('click', function(e) {
        // 기존 리플 제거
        const existingRipple = this.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        // 새 리플 생성
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // 리플 위치 계산
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    });
}

// 입력 필드 개선
function enhanceInputField(input) {
    if (input.classList.contains('enhanced-input')) return;
    
    input.classList.add('enhanced-input');
    
    // 포커스 상태 개선
    input.addEventListener('focus', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 4px 12px rgba(26, 115, 232, 0.15)';
    });
    
    input.addEventListener('blur', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
    });
    
    // 입력 시 애니메이션
    input.addEventListener('input', function() {
        this.style.transform = 'scale(1.002)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
}

// 체크박스와 라디오 개선
function enhanceCheckboxRadio(element) {
    if (element.classList.contains('enhanced-checkbox')) return;
    
    element.classList.add('enhanced-checkbox');
    
    const container = element.closest('.checkbox-item, .radio-item');
    if (container) {
        container.addEventListener('click', function(e) {
            if (e.target === element) return;
            
            // 리플 효과
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                left: 12px;
                top: 50%;
                width: 40px;
                height: 40px;
                background: rgba(26, 115, 232, 0.1);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: checkboxRipple 0.4s ease-out;
                pointer-events: none;
                z-index: 0;
            `;
            
            container.style.position = 'relative';
            container.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 400);
        });
    }
}

// 머티리얼 리플 효과 전체 적용
function addMaterialRipples() {
    // CSS 애니메이션 추가
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes rippleEffect {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            @keyframes checkboxRipple {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 부드러운 애니메이션 추가
function addSmoothAnimations() {
    // 페이드 인 애니메이션 관찰자
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // 모든 폼 그룹에 애니메이션 적용
    document.querySelectorAll('.form-group').forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(group);
    });
}

// 키보드 내비게이션 개선
function enhanceKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Tab 키 순환 개선
        if (e.key === 'Tab') {
            const modal = document.querySelector('.modal[style*="display: block"], .modal[style*="display: flex"]');
            if (modal) {
                const focusableElements = modal.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }
        
        // Enter 키로 버튼 활성화
        if (e.key === 'Enter') {
            const focused = document.activeElement;
            if (focused && focused.classList.contains('btn-primary', 'btn-secondary')) {
                e.preventDefault();
                focused.click();
            }
        }
    });
}

// 로딩 상태 추가
function addLoadingStates() {
    // 버튼 로딩 상태 함수
    window.setButtonLoading = function(buttonId, loading = true) {
        const button = document.getElementById(buttonId) || document.querySelector(`[data-button-id="${buttonId}"]`);
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            const originalText = button.textContent;
            button.setAttribute('data-original-text', originalText);
            
            button.innerHTML = `
                <span class="loading-spinner"></span>
                <span>처리 중...</span>
            `;
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text') || button.textContent;
            button.textContent = originalText;
            button.style.opacity = '1';
        }
    };
}

// 포커스 관리 개선
function improveFocusManagement() {
    // 모달 열릴 때 첫 번째 입력 필드에 포커스
    const modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const modal = mutation.target;
                if (modal.classList.contains('modal') && modal.style.display === 'block') {
                    setTimeout(() => {
                        const firstInput = modal.querySelector('.form-input, .btn-primary');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }, 300);
                }
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modalObserver.observe(modal, { attributes: true, attributeFilter: ['style'] });
    });
}

// 토스트 알림 시스템
function showCloudToast(message, type = 'info', duration = 3000) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.cloud-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `cloud-toast cloud-toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: var(--cloud-surface);
        border: 1px solid var(--cloud-outline-variant);
        border-radius: var(--cloud-radius-medium);
        padding: 16px 20px;
        box-shadow: var(--cloud-elevation-4);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        max-width: 400px;
        min-width: 280px;
    `;
    
    document.body.appendChild(toast);
    
    // 애니메이션 트리거
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    
    // 자동 제거
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// 폼 유효성 검사 개선
function enhanceFormValidation() {
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            
            this.style.borderColor = 'var(--cloud-error)';
            this.style.boxShadow = '0 0 0 2px rgba(217, 48, 37, 0.2)';
            
            // 에러 메시지 표시
            let errorMsg = this.parentNode.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.cssText = `
                    color: var(--cloud-error);
                    font-size: 12px;
                    margin-top: 8px;
                    animation: fadeInUp 0.2s ease;
                `;
                this.parentNode.appendChild(errorMsg);
            }
            
            errorMsg.textContent = this.validationMessage;
        });
        
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

// DOM 준비 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeCloudUI, 200);
        setTimeout(enhanceFormValidation, 300);
    });
} else {
    setTimeout(initializeCloudUI, 200);
    setTimeout(enhanceFormValidation, 300);
}

// 전역 함수로 내보내기
window.cloudUI = {
    showToast: showCloudToast,
    setButtonLoading: window.setButtonLoading,
    applyCloudStyling
};