// 라이트/다크 모드 토글 기능

class ThemeToggle {
    constructor() {
        this.init();
    }

    init() {
        this.createToggleButton();
        this.loadSavedTheme();
        this.bindEvents();
    }

    createToggleButton() {
        // 버튼이 이미 HTML에 있으면 사용, 없으면 생성
        this.toggleBtn = document.getElementById('themeToggle');
        if (!this.toggleBtn) {
            const container = document.createElement('div');
            container.className = 'theme-toggle-container';
            container.innerHTML = `
                <button id="themeToggle" class="theme-toggle-btn" title="라이트/다크 모드 전환">
                    <span class="theme-icon">🌙</span>
                </button>
            `;
            document.body.appendChild(container);
            this.toggleBtn = document.getElementById('themeToggle');
        }
        
        // 안전하게 테마 아이콘 찾기
        this.themeIcon = this.toggleBtn ? this.toggleBtn.querySelector('.theme-icon') : null;
        
        // 아이콘이 없으면 버튼 자체에 텍스트 설정
        if (!this.themeIcon && this.toggleBtn && !this.toggleBtn.textContent.trim()) {
            this.toggleBtn.textContent = '🌙';
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // 테마 아이콘이 있으면 업데이트
        if (this.themeIcon) {
            if (theme === 'dark') {
                this.themeIcon.textContent = '☀️';
                this.toggleBtn.title = '라이트 모드로 전환';
            } else {
                this.themeIcon.textContent = '🌙';
                this.toggleBtn.title = '다크 모드로 전환';
            }
        } else if (this.toggleBtn) {
            // 테마 아이콘이 없으면 버튼 자체의 텍스트 업데이트
            if (theme === 'dark') {
                this.toggleBtn.textContent = '☀️';
                this.toggleBtn.title = '라이트 모드로 전환';
            } else {
                this.toggleBtn.textContent = '🌙';
                this.toggleBtn.title = '다크 모드로 전환';
            }
        }
        
        localStorage.setItem('theme', theme);
        
        // 커스텀 이벤트 발생 (다른 컴포넌트가 테마 변경을 감지할 수 있도록)
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // 토글 애니메이션 효과
        this.toggleBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.toggleBtn.style.transform = 'scale(1)';
        }, 150);
    }

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // 키보드 단축키 (Ctrl + Shift + T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // 시스템 테마 변경 감지 (선택사항)
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // 사용자가 수동으로 설정하지 않았을 때만 시스템 테마를 따름
                if (!localStorage.getItem('theme-manual-override')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // 수동 테마 설정 표시 (사용자가 직접 토글했을 때)
    setManualOverride() {
        localStorage.setItem('theme-manual-override', 'true');
    }
}

// DOM이 로드되면 테마 토글 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
    
    // 기존 테마 토글 버튼이 있다면 이벤트 연결
    const existingToggle = document.getElementById('themeToggle');
    if (existingToggle) {
        existingToggle.addEventListener('click', () => {
            window.themeToggle.toggleTheme();
            window.themeToggle.setManualOverride();
        });
    }
});

// 즉시 테마 적용 (FOUC 방지)
(function() {
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
})();