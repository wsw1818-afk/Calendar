/**
 * 테마와 레이아웃 메뉴 기능 확장
 * 다크/라이트 모드 토글 및 그리드/리스트 뷰 전환 추가
 */

(function() {
    'use strict';
    
    console.log('🎨 테마/레이아웃 메뉴 확장 초기화');
    
    // ========== 다크 모드 설정 ==========
    const darkModeConfig = {
        enabled: localStorage.getItem('darkMode') === 'true',
        colors: {
            light: {
                background: '#ffffff',
                text: '#333333',
                border: '#dddddd',
                header: '#f8f9fa',
                dayBg: '#ffffff',
                todayBg: '#f5f5f5',
                memoBg: '#f0f8ff',
                pageBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            dark: {
                background: '#1a1a1a',
                text: '#e0e0e0',
                border: '#444444',
                header: '#2d2d2d',
                dayBg: '#2a2a2a',
                todayBg: '#3a3a3a',
                memoBg: '#333344',
                pageBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            }
        }
    };
    
    // 레이아웃 뷰 설정 제거됨
    
    // ========== 다크 모드 토글 ==========
    function toggleDarkMode() {
        darkModeConfig.enabled = !darkModeConfig.enabled;
        localStorage.setItem('darkMode', darkModeConfig.enabled);
        applyDarkMode();
        
        // 토글 버튼 업데이트
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = darkModeConfig.enabled ? '🌙 다크 모드' : '☀️ 라이트 모드';
        }
        
        showNotification(darkModeConfig.enabled ? '다크 모드 활성화' : '라이트 모드 활성화');
    }
    
    // ========== 다크 모드 적용 ==========
    function applyDarkMode() {
        const colors = darkModeConfig.enabled ? darkModeConfig.colors.dark : darkModeConfig.colors.light;
        
        // CSS 변수 설정
        const root = document.documentElement;
        root.style.setProperty('--bg-color', colors.background);
        root.style.setProperty('--text-color', colors.text);
        root.style.setProperty('--border-color', colors.border);
        root.style.setProperty('--header-bg', colors.header);
        
        // body 스타일
        document.body.style.background = colors.pageBg;
        document.body.classList.toggle('dark-mode', darkModeConfig.enabled);
        
        // 달력 컨테이너
        const container = document.querySelector('.container');
        if (container) {
            container.style.background = colors.background;
            container.style.color = colors.text;
        }
        
        // 날짜 셀들
        document.querySelectorAll('.day').forEach(day => {
            if (!day.classList.contains('empty')) {
                day.style.background = colors.dayBg;
                day.style.color = colors.text;
                day.style.borderColor = colors.border;
            }
        });
        
        // 오늘 날짜
        const today = document.querySelector('.day.today');
        if (today) {
            today.style.background = colors.todayBg;
        }
        
        // 메모가 있는 날짜
        document.querySelectorAll('.has-memo').forEach(elem => {
            elem.style.background = colors.memoBg;
        });
        
        // 모달들
        document.querySelectorAll('.modal-content').forEach(modal => {
            modal.style.background = colors.background;
            modal.style.color = colors.text;
            modal.style.borderColor = colors.border;
        });
    }
    
    // 레이아웃 뷰 전환 기능 제거됨
    
    // ========== 글자 크기 조절 ==========
    const fontSizeConfig = {
        current: parseInt(localStorage.getItem('globalFontSize') || '14'),
        min: 10,
        max: 24,
        step: 2
    };
    
    function adjustFontSize(direction) {
        const increment = direction === 'increase' ? fontSizeConfig.step : -fontSizeConfig.step;
        const newSize = Math.max(fontSizeConfig.min, Math.min(fontSizeConfig.max, fontSizeConfig.current + increment));
        
        if (newSize !== fontSizeConfig.current) {
            fontSizeConfig.current = newSize;
            localStorage.setItem('globalFontSize', newSize);
            applyFontSize();
            showNotification(`글자 크기: ${newSize}px`);
        }
    }
    
    function applyFontSize() {
        const size = fontSizeConfig.current;
        document.documentElement.style.setProperty('--base-font-size', size + 'px');
        
        // 달력 관련 요소들
        document.querySelectorAll('.day-number').forEach(elem => {
            elem.style.fontSize = size + 'px';
        });
        
        document.querySelectorAll('.weekday').forEach(elem => {
            elem.style.fontSize = (size + 2) + 'px';
        });
        
        document.querySelector('#monthYear')?.style.setProperty('font-size', (size + 6) + 'px');
        
        // 메뉴 버튼들
        document.querySelectorAll('.menu-btn').forEach(elem => {
            elem.style.fontSize = size + 'px';
        });
    }
    
    // ========== 색상 빠른 변경 ==========
    const quickColorConfig = {
        themes: [
            { name: '기본', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', today: '#f5f5f5', memo: '#f0f8ff' },
            { name: '바다', bg: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', today: '#e8f4ff', memo: '#e0ffe0' },
            { name: '석양', bg: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', today: '#fff8dc', memo: '#fff0e6' },
            { name: '숲', bg: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)', today: '#f0fff0', memo: '#e8f5e8' },
            { name: '체리', bg: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', today: '#ffecec', memo: '#ffe4e1' },
            { name: '라벤더', bg: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', today: '#f3e5f5', memo: '#e6e6fa' }
        ],
        currentIndex: 0
    };
    
    function cycleQuickColor() {
        quickColorConfig.currentIndex = (quickColorConfig.currentIndex + 1) % quickColorConfig.themes.length;
        const theme = quickColorConfig.themes[quickColorConfig.currentIndex];
        
        // 색상 적용
        document.body.style.background = theme.bg;
        
        const calendar = document.querySelector('.container');
        if (calendar) {
            calendar.style.background = '#ffffff';
        }
        
        // 오늘 날짜 색상
        const today = document.querySelector('.day.today');
        if (today) {
            today.style.background = theme.today;
        }
        
        // 메모가 있는 날짜들
        document.querySelectorAll('.has-memo').forEach(elem => {
            elem.style.background = theme.memo;
        });
        
        // localStorage에 저장
        const themeData = {
            pageBg: theme.bg,
            calendarBoxBg: '#ffffff',
            todayBg: theme.today,
            memoBg: theme.memo
        };
        localStorage.setItem('calendarTheme', JSON.stringify(themeData));
        
        showNotification(`${theme.name} 테마 적용`);
    }
    
    // ========== 확장 메뉴 생성 ==========
    function createEnhancedMenu() {
        // 기존 메뉴 컨테이너 찾기
        let menuContainer = document.querySelector('.action-controls');
        if (!menuContainer) {
            console.log('메뉴 컨테이너를 찾을 수 없음, 새로 생성');
            const scheduleBar = document.querySelector('.schedule-add-bar');
            if (scheduleBar) {
                menuContainer = document.createElement('div');
                menuContainer.className = 'action-controls enhanced-menu';
                scheduleBar.appendChild(menuContainer);
            } else {
                console.error('스케줄 바를 찾을 수 없음');
                return;
            }
        }
        
        // 글자 크기 상세 설정 버튼
        const fontSizeBtn = document.createElement('button');
        fontSizeBtn.id = 'fontSizeDetailBtn';
        fontSizeBtn.className = 'menu-btn font-detail-btn';
        fontSizeBtn.innerHTML = '📝 글자 크기';
        fontSizeBtn.title = '글자 크기 상세 설정';
        fontSizeBtn.onclick = () => {
            if (window.AdvancedControls) {
                window.AdvancedControls.openFontSizeModal();
            } else {
                console.error('Advanced Controls not loaded');
            }
        };
        
        // 색상 모드 상세 설정 버튼  
        const colorModeBtn = document.createElement('button');
        colorModeBtn.id = 'colorModeDetailBtn';
        colorModeBtn.className = 'menu-btn color-mode-btn';
        colorModeBtn.innerHTML = '🎨 색상 모드';
        colorModeBtn.title = '색상 및 테마 상세 설정';
        colorModeBtn.onclick = () => {
            if (window.AdvancedControls) {
                window.AdvancedControls.openColorModeModal();
            } else {
                console.error('Advanced Controls not loaded');
            }
        };
        
        // 다크 모드 토글 버튼
        const darkModeBtn = document.createElement('button');
        darkModeBtn.id = 'darkModeToggle';
        darkModeBtn.className = 'menu-btn toggle-btn';
        darkModeBtn.innerHTML = darkModeConfig.enabled ? '🌙 다크 모드' : '☀️ 라이트 모드';
        darkModeBtn.onclick = toggleDarkMode;
        
        // 뷰 선택 기능 제거됨
        
        // 기존 테마/레이아웃 버튼에 새 기능 추가
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            // 우클릭으로 빠른 다크모드 토글
            themeBtn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleDarkMode();
            });
        }
        
        // 레이아웃 버튼 우클릭 이벤트 제거됨
        
        // 메뉴에 추가 (뷰 선택기 제외)
        menuContainer.insertBefore(fontSizeBtn, menuContainer.firstChild);
        menuContainer.insertBefore(colorModeBtn, fontSizeBtn.nextSibling);
        menuContainer.insertBefore(darkModeBtn, colorModeBtn.nextSibling);
        
        // 뷰 선택기 이벤트 리스너 제거됨
    }
    
    // ========== 알림 표시 ==========
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // ========== CSS 스타일 추가 ==========
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS 변수 */
            :root {
                --bg-color: #ffffff;
                --text-color: #333333;
                --border-color: #dddddd;
                --header-bg: #f8f9fa;
            }
            
            /* 다크 모드 */
            body.dark-mode {
                --bg-color: #1a1a1a;
                --text-color: #e0e0e0;
                --border-color: #444444;
                --header-bg: #2d2d2d;
            }
            
            /* 메뉴 버튼 스타일 */
            .menu-btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: 1px solid var(--border-color);
                background: var(--bg-color);
                color: var(--text-color);
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
                font-weight: 500;
            }
            
            .menu-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .toggle-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
            }
            
            /* 뷰 선택기 및 뷰 스타일 제거됨 */
            
            /* 애니메이션 */
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            /* 향상된 메뉴 스타일 */
            .enhanced-menu {
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========== 초기화 ==========
    function initialize() {
        console.log('🚀 테마/레이아웃 메뉴 확장 시작');
        
        // 스타일 추가
        addStyles();
        
        // DOM 로드 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    function init() {
        // 메뉴 생성
        setTimeout(() => {
            createEnhancedMenu();
            
            // 초기 설정 적용
            if (darkModeConfig.enabled) {
                applyDarkMode();
            }
            
            applyFontSize(); // 글자 크기 적용
            
            console.log('✅ 테마/레이아웃 메뉴 확장 완료');
        }, 100);
    }
    
    // 시작
    initialize();
    
    // 전역 API 노출
    window.ThemeLayoutMenu = {
        toggleDarkMode,
        applyDarkMode,
        adjustFontSize,
        cycleQuickColor,
        applyFontSize,
        getDarkModeStatus: () => darkModeConfig.enabled,
        getCurrentFontSize: () => fontSizeConfig.current
    };
    
})();