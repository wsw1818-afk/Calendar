// 스티커 메모 색상 변경 기능

// 색상 테마 데이터
const STICKY_MEMO_THEMES = {
    yellow: { name: '노란색', emoji: '💛' },
    pink: { name: '분홍색', emoji: '💗' },
    blue: { name: '파란색', emoji: '💙' },
    green: { name: '초록색', emoji: '💚' },
    purple: { name: '보라색', emoji: '💜' },
    orange: { name: '주황색', emoji: '🧡' },
    red: { name: '빨간색', emoji: '❤️' },
    gray: { name: '회색', emoji: '🩶' },
    white: { name: '흰색', emoji: '🤍' },
    black: { name: '검은색', emoji: '🖤' }
};

// 스티커 메모 색상 변경 시스템
class StickyMemoColorSystem {
    constructor() {
        this.currentTheme = 'yellow'; // 기본 테마
        this.stickyMemo = null;
        console.log('🎨 스티커 메모 색상 시스템 초기화');
    }

    // 색상 팔레트 HTML 생성
    createColorPalette() {
        const paletteHTML = `
            <div class="color-palette-container">
                <div class="color-palette-label">
                    메모 색상
                    <button class="color-reset-btn" onclick="stickyMemoColors.resetToDefault()">기본값</button>
                </div>
                <div class="color-palette" id="stickyColorPalette">
                    ${Object.keys(STICKY_MEMO_THEMES).map(color => `
                        <div class="color-btn ${color === this.currentTheme ? 'active' : ''}" 
                             data-color="${color}" 
                             onclick="stickyMemoColors.changeColor('${color}')"
                             title="${STICKY_MEMO_THEMES[color].name}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        return paletteHTML;
    }

    // 기존 스티커 메모 생성 함수 확장
    enhanceStickyMemoCreation() {
        // 기존 createStickyMemo 함수를 확장
        const originalCreateStickyMemo = window.createStickyMemo;
        
        window.createStickyMemo = () => {
            const stickyMemo = originalCreateStickyMemo();
            this.stickyMemo = stickyMemo;
            
            // 색상 팔레트를 헤더 아래에 추가
            const header = stickyMemo.querySelector('.sticky-memo-header');
            if (header && !stickyMemo.querySelector('.color-palette-container')) {
                const colorPaletteContainer = document.createElement('div');
                colorPaletteContainer.innerHTML = this.createColorPalette();
                header.insertAdjacentElement('afterend', colorPaletteContainer.firstElementChild);
                console.log('🎨 색상 팔레트가 스티커 메모에 추가됨');
            }
            
            // 저장된 테마 적용
            this.loadSavedTheme();
            
            return stickyMemo;
        };
        
        console.log('✅ 스티커 메모 생성 함수 확장 완료');
    }

    // 색상 변경 함수
    changeColor(colorName) {
        if (!this.stickyMemo) {
            this.stickyMemo = document.getElementById('stickyMemo');
        }
        
        if (!this.stickyMemo) {
            console.warn('⚠️ 스티커 메모를 찾을 수 없습니다');
            return;
        }

        console.log(`🎨 색상 변경: ${this.currentTheme} → ${colorName}`);
        
        // 이전 테마 제거
        this.stickyMemo.removeAttribute('data-theme');
        this.stickyMemo.classList.remove(`theme-${this.currentTheme}`);
        
        // 새 테마 적용
        this.currentTheme = colorName;
        this.stickyMemo.setAttribute('data-theme', colorName);
        this.stickyMemo.classList.add(`theme-${colorName}`);
        
        // 애니메이션 효과
        this.stickyMemo.classList.add('color-changing');
        setTimeout(() => {
            this.stickyMemo.classList.remove('color-changing');
        }, 300);
        
        // 팔레트에서 활성 색상 업데이트
        this.updateActivePalette();
        
        // 테마 저장
        this.saveCurrentTheme();
        
        // 알림 표시
        this.showColorChangeNotification(colorName);
        
        console.log(`✅ ${STICKY_MEMO_THEMES[colorName].name} 테마 적용 완료`);
    }

    // 팔레트에서 활성 색상 업데이트
    updateActivePalette() {
        const palette = document.getElementById('stickyColorPalette');
        if (!palette) return;
        
        // 모든 색상 버튼에서 active 클래스 제거
        palette.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 현재 테마 버튼에 active 클래스 추가
        const activeBtn = palette.querySelector(`[data-color="${this.currentTheme}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // 기본값으로 리셋
    resetToDefault() {
        this.changeColor('yellow');
        this.showNotification('🎨 기본 색상으로 초기화되었습니다', 'info');
    }

    // 테마 저장
    saveCurrentTheme() {
        try {
            localStorage.setItem('stickyMemoTheme', this.currentTheme);
            console.log(`💾 테마 저장됨: ${this.currentTheme}`);
        } catch (error) {
            console.error('❌ 테마 저장 실패:', error);
        }
    }

    // 저장된 테마 로드
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('stickyMemoTheme');
            if (savedTheme && STICKY_MEMO_THEMES[savedTheme]) {
                this.changeColor(savedTheme);
                console.log(`📂 저장된 테마 로드됨: ${savedTheme}`);
            } else {
                this.changeColor('yellow'); // 기본값
            }
        } catch (error) {
            console.error('❌ 테마 로드 실패:', error);
            this.changeColor('yellow');
        }
    }

    // 색상 변경 알림 표시
    showColorChangeNotification(colorName) {
        const theme = STICKY_MEMO_THEMES[colorName];
        const message = `${theme.emoji} ${theme.name} 테마로 변경되었습니다`;
        this.showNotification(message, 'success');
    }

    // 알림 표시 함수
    showNotification(message, type = 'info') {
        // 기존 알림이 있으면 제거
        const existingNotification = document.querySelector('.sticky-color-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `sticky-color-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 스타일 적용
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
            transform: translateX(0);
        `;
        
        if (type === 'success') {
            notification.style.borderLeftColor = '#10b981';
            notification.style.borderLeftWidth = '4px';
        }
        
        document.body.appendChild(notification);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    // 현재 테마 정보 반환
    getCurrentThemeInfo() {
        return {
            color: this.currentTheme,
            name: STICKY_MEMO_THEMES[this.currentTheme].name,
            emoji: STICKY_MEMO_THEMES[this.currentTheme].emoji
        };
    }

    // 디버깅 정보
    getDebugInfo() {
        return {
            currentTheme: this.currentTheme,
            stickyMemoExists: !!this.stickyMemo,
            availableThemes: Object.keys(STICKY_MEMO_THEMES),
            savedTheme: localStorage.getItem('stickyMemoTheme')
        };
    }
}

// 애니메이션 CSS 추가
const animationStyles = document.createElement('style');
animationStyles.innerHTML = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #333;
    }
`;
document.head.appendChild(animationStyles);

// 전역 인스턴스 생성
const stickyMemoColors = new StickyMemoColorSystem();

// 페이지 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    stickyMemoColors.enhanceStickyMemoCreation();
    console.log('🎨 스티커 메모 색상 시스템 준비 완료');
});

// 디버깅용 전역 함수
window.debugStickyMemoColors = () => {
    console.log('🐛 스티커 메모 색상 시스템 디버그 정보:', stickyMemoColors.getDebugInfo());
    return stickyMemoColors.getDebugInfo();
};

console.log('🎨 스티커 메모 색상 변경 시스템 로드 완료');
console.log('🛠️ 사용법: stickyMemoColors.changeColor("색상명") 또는 팔레트에서 클릭');
console.log('🔍 디버깅: debugStickyMemoColors() 또는 stickyMemoColors.getDebugInfo()');