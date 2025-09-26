/**
 * 모달 중앙 정렬 및 다크 모드 기능
 */

(function() {
    'use strict';
    
    console.log('🎯 모달 중앙 정렬 및 다크 모드 초기화');
    
    // ========== 밝기 모드 토글 버튼 생성 ==========
    function createBrightnessToggle() {
        // 기존 버튼이 있으면 제거
        const existing = document.getElementById('brightnessToggle');
        if (existing) {
            existing.remove();
        }
        
        // 새 버튼 생성
        const button = document.createElement('button');
        button.id = 'brightnessToggle';
        button.innerHTML = '🌙';
        button.title = '어둠 모드로 전환';
        
        // 버튼 클릭 이벤트
        button.addEventListener('click', toggleBrightnessMode);
        
        // body에 추가
        document.body.appendChild(button);
        
        console.log('✅ 밝기 모드 토글 버튼 생성 완료');
    }
    
    // ========== 밝기 모드 전환 ==========
    function toggleBrightnessMode() {
        const body = document.body;
        const isDarkMode = body.classList.toggle('dark-mode');
        
        // body 전체에 강제 스타일 적용
        if (isDarkMode) {
            body.style.setProperty('background', '#1a1a1a', 'important');
            body.style.setProperty('color', '#ffffff', 'important');
        } else {
            body.style.removeProperty('background');
            body.style.removeProperty('color');
        }
        
        // 밝기 모드 상태 저장
        localStorage.setItem('brightnessMode', isDarkMode ? 'dark' : 'light');
        
        // 버튼 아이콘 변경
        const button = document.getElementById('brightnessToggle');
        if (button) {
            button.innerHTML = isDarkMode ? '☀️' : '🌙';
            button.title = isDarkMode ? '밝기 모드로 전환' : '어둠 모드로 전환';
        }
        
        console.log(`🔄 현재 모드: ${isDarkMode ? '어둠 모드' : '밝기 모드'}`);
        
        // 달력 날짜 텍스트 색상 강제 업데이트
        updateCalendarTextColors(isDarkMode);
        
        // 즉시 전체 페이지 강제 업데이트
        setTimeout(() => {
            forceUpdateAllElements(isDarkMode);
        }, 100);
    }
    
    // 이전 버전과의 호환성을 위한 함수
    function toggleDarkMode() {
        toggleBrightnessMode();
    }
    
    // ========== 달력 텍스트 색상 업데이트 ==========
    function updateCalendarTextColors(isDarkMode) {
        // 모든 날짜 관련 요소들 선택 (확장)
        const selectors = [
            '.day', '.days > div', '.day-number', '.weekday',
            '.date', '.calendar-date', '.calendar-day',
            '#monthYear', '.month-year', '.calendar-title',
            '.calendar', '.calendar-grid', '#calendarGrid',
            '.calendar-header', '#calendarTitle', '.container',
            'div[class*="day"]', 'div[class*="date"]', 'div[class*="calendar"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(elem => {
                if (isDarkMode) {
                    elem.style.setProperty('color', '#ffffff', 'important');
                    // 자식 요소들도 업데이트
                    elem.querySelectorAll('*').forEach(child => {
                        child.style.setProperty('color', '#ffffff', 'important');
                    });
                } else {
                    elem.style.removeProperty('color');
                    elem.querySelectorAll('*').forEach(child => {
                        child.style.removeProperty('color');
                    });
                }
            });
        });
        
        // 전체 달력 영역의 모든 요소 강제 업데이트
        const calendarAreas = [
            document.getElementById('calendarGrid'),
            document.querySelector('.calendar'),
            document.querySelector('.container'),
            document.querySelector('.calendar-grid')
        ];
        
        calendarAreas.forEach(area => {
            if (area) {
                // 배경색 설정
                if (isDarkMode) {
                    area.style.setProperty('background', '#2d2d2d', 'important');
                    area.style.setProperty('background-color', '#2d2d2d', 'important');
                } else {
                    area.style.removeProperty('background');
                    area.style.removeProperty('background-color');
                }
                
                // 모든 하위 요소의 텍스트 색상 설정
                const allElements = area.querySelectorAll('*');
                allElements.forEach(elem => {
                    if (isDarkMode) {
                        elem.style.setProperty('color', '#ffffff', 'important');
                        // 배경이 있는 요소들도 다크 모드로 설정
                        if (elem.style.backgroundColor || window.getComputedStyle(elem).backgroundColor !== 'rgba(0, 0, 0, 0)') {
                            elem.style.setProperty('background', '#2d2d2d', 'important');
                            elem.style.setProperty('background-color', '#2d2d2d', 'important');
                        }
                    } else {
                        elem.style.removeProperty('color');
                        elem.style.removeProperty('background');
                        elem.style.removeProperty('background-color');
                    }
                });
            }
        });
        
        // 모든 입력 요소 강제 업데이트
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (isDarkMode) {
                input.style.setProperty('background', '#2d2d2d', 'important');
                input.style.setProperty('color', '#ffffff', 'important');
                input.style.setProperty('border', '2px solid #555', 'important');
                input.style.setProperty('border-radius', '6px', 'important');
            } else {
                input.style.removeProperty('background');
                input.style.removeProperty('color');
                input.style.removeProperty('border');
                input.style.removeProperty('border-radius');
            }
        });
        
        // 메모 관련 요소들 특별 처리
        const memoElements = document.querySelectorAll('.memo-content, .memo-item, .memo-title, .memo-list');
        memoElements.forEach(elem => {
            if (isDarkMode) {
                elem.style.setProperty('background', '#2d2d2d', 'important');
                elem.style.setProperty('color', '#ffffff', 'important');
                elem.style.setProperty('border-color', '#555', 'important');
            } else {
                elem.style.removeProperty('background');
                elem.style.removeProperty('color');
                elem.style.removeProperty('border-color');
            }
        });
        
        console.log('✅ 달력 텍스트 색상 업데이트 완료');
    }
    
    // ========== 저장된 밝기 모드 상태 복원 ==========
    function restoreBrightnessMode() {
        // 기본값은 밝기 모드 (light)
        const brightnessMode = localStorage.getItem('brightnessMode') || 'light';
        const isDarkMode = brightnessMode === 'dark';
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        const button = document.getElementById('brightnessToggle');
        if (button) {
            button.innerHTML = isDarkMode ? '☀️' : '🌙';
            button.title = isDarkMode ? '밝기 모드로 전환' : '어둠 모드로 전환';
        }
        
        updateCalendarTextColors(isDarkMode);
        
        // body 전체에 강제 스타일 적용
        if (isDarkMode) {
            document.body.style.setProperty('background', '#1a1a1a', 'important');
            document.body.style.setProperty('color', '#ffffff', 'important');
        }
        
        // 전체 요소 강제 업데이트
        setTimeout(() => {
            forceUpdateAllElements(isDarkMode);
        }, 200);
        
        console.log(`✅ 밝기 모드 복원: ${isDarkMode ? '어둠 모드' : '밝기 모드'}`);
    }
    
    // 이전 버전과의 호환성
    function restoreDarkMode() {
        restoreBrightnessMode();
    }
    
    // ========== 모달 중앙 정렬 보장 ==========
    function ensureModalCenter() {
        // MutationObserver로 새로운 모달 감지
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('modal')) {
                        setupModalCenter(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 기존 모달들도 설정
        document.querySelectorAll('.modal').forEach(modal => {
            setupModalCenter(modal);
        });
        
        console.log('✅ 모달 중앙 정렬 감시 설정 완료');
    }
    
    // ========== 개별 모달 중앙 정렬 설정 ==========
    function setupModalCenter(modal) {
        // 모달이 열릴 때마다 중앙 정렬 확인
        const originalShow = modal.style.display;
        
        // 즉시 스타일 적용
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.zIndex = '9999';
        
        // display 속성 변경 감지
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = modal.style.display;
                    if (display === 'block' || display === 'flex') {
                        // flex로 변경하여 중앙 정렬
                        modal.style.display = 'flex';
                        modal.style.alignItems = 'center';
                        modal.style.justifyContent = 'center';
                        
                        // 모달 콘텐츠 중앙 정렬
                        const content = modal.querySelector('.modal-content');
                        if (content) {
                            content.style.position = 'relative';
                            content.style.margin = 'auto';
                        }
                        
                        // 모달이 열렸을 때 다크 모드 색상 즉시 적용
                        if (document.body.classList.contains('dark-mode')) {
                            setTimeout(() => {
                                updateCalendarTextColors(true);
                                updateModalInputs(modal, true);
                            }, 100);
                        }
                    }
                }
            });
        });
        
        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
    
    // ========== 모달 입력 요소 업데이트 ==========
    function updateModalInputs(modal, isDarkMode) {
        const inputs = modal.querySelectorAll('input, textarea, select, label');
        inputs.forEach(input => {
            if (isDarkMode) {
                if (input.tagName.toLowerCase() !== 'label') {
                    input.style.setProperty('background', '#2d2d2d', 'important');
                    input.style.setProperty('color', '#ffffff', 'important');
                    input.style.setProperty('border', '2px solid #555', 'important');
                } else {
                    input.style.setProperty('color', '#ffffff', 'important');
                }
            } else {
                // 밝기 모드에서 명확한 색상 적용
                if (input.tagName.toLowerCase() !== 'label') {
                    input.style.setProperty('background', 'white', 'important');
                    input.style.setProperty('color', '#333', 'important');
                    input.style.setProperty('border', '1px solid #ccc', 'important');
                } else {
                    input.style.setProperty('color', '#333', 'important');
                }
            }
        });
        
        // 모든 텍스트 요소도 업데이트
        const texts = modal.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
        texts.forEach(text => {
            if (isDarkMode) {
                text.style.setProperty('color', '#ffffff', 'important');
            } else {
                text.style.setProperty('color', '#333', 'important');
            }
        });
        
        // 버튼도 업데이트
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.classList.contains('close')) {
                if (isDarkMode) {
                    button.style.setProperty('background', '#3d3d3d', 'important');
                    button.style.setProperty('color', '#ffffff', 'important');
                    button.style.setProperty('border', '1px solid #555', 'important');
                } else {
                    button.style.setProperty('background', '#667eea', 'important');
                    button.style.setProperty('color', 'white', 'important');
                    button.style.setProperty('border', '1px solid #667eea', 'important');
                }
            }
        });
    }
    
    // ========== 전체 요소 강제 업데이트 ==========
    function forceUpdateAllElements(isDarkMode) {
        // 모든 div, span, p, h 태그 등 업데이트
        const allElements = document.querySelectorAll('*');
        allElements.forEach(elem => {
            if (isDarkMode) {
                // 텍스트가 있는 요소만 색상 변경
                if (elem.textContent && elem.textContent.trim() && 
                    !elem.querySelector('input') && !elem.querySelector('textarea')) {
                    elem.style.setProperty('color', '#ffffff', 'important');
                }
                
                // 배경이 흰색이거나 밝은 색인 경우 다크 모드로 변경
                const computedStyle = window.getComputedStyle(elem);
                const bgColor = computedStyle.backgroundColor;
                if (bgColor === 'rgb(255, 255, 255)' || bgColor === 'white' || 
                    bgColor.includes('255, 255, 255')) {
                    elem.style.setProperty('background-color', '#2d2d2d', 'important');
                }
            } else {
                // 밝기 모드일 때 강제 스타일 제거하고 기본값 적용
                if (!elem.classList.contains('modal') && !elem.closest('.modal')) {
                    elem.style.removeProperty('color');
                    elem.style.removeProperty('background-color');
                    elem.style.removeProperty('background');
                }
            }
        });
        
        // 달력 셀들의 테두리 강화
        const calendarCells = document.querySelectorAll('.day, .days > div, .calendar-day, [class*="day"]');
        calendarCells.forEach(cell => {
            if (isDarkMode) {
                cell.style.setProperty('border', '1px solid #666', 'important');
            } else {
                cell.style.setProperty('border', '1px solid #333', 'important');
            }
        });
        
        console.log('🔄 전체 요소 강제 업데이트 완료');
    }
    
    // ========== 전역 함수 등록 ==========
    window.toggleDarkMode = toggleDarkMode;
    window.updateModalInputs = updateModalInputs;
    window.forceUpdateAllElements = forceUpdateAllElements;
    
    // ========== ESC 키 기능 ==========
    function setupEscapeKey() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // 열린 모달 찾기
                const openModals = document.querySelectorAll('.modal[style*="display: block"], .modal[style*="display: flex"], .modal.show');
                openModals.forEach(modal => {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                });
                
                if (openModals.length > 0) {
                    console.log('🚪 ESC 키로 모달 닫기');
                }
            }
        });
        
        console.log('✅ ESC 키 기능 설정 완료');
    }
    
    // ========== 닫기 버튼 기능 강화 ==========
    function enhanceCloseButtons() {
        // 기존 닫기 버튼들에 이벤트 추가
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('close') || e.target.innerHTML === '×' || e.target.innerHTML === '&times;') {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    console.log('🚪 닫기 버튼으로 모달 닫기');
                }
            }
        });
        
        // 모달 외부 클릭으로 닫기
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                e.target.classList.remove('show');
                console.log('🚪 외부 클릭으로 모달 닫기');
            }
        });
        
        console.log('✅ 닫기 버튼 기능 강화 완료');
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 모달 중앙 정렬 및 밝기 모드 초기화 시작');
        
        // 밝기 모드 토글 버튼 생성
        createBrightnessToggle();
        
        // 저장된 밝기 모드 상태 복원
        restoreBrightnessMode();
        
        // 모달 중앙 정렬 설정
        ensureModalCenter();
        
        // ESC 키 기능 설정
        setupEscapeKey();
        
        // 닫기 버튼 기능 강화
        enhanceCloseButtons();
        
        // 달력이 업데이트될 때마다 다크 모드 색상 재적용
        const calendarObserver = new MutationObserver(function() {
            if (document.body.classList.contains('dark-mode')) {
                updateCalendarTextColors(true);
            }
        });
        
        const daysContainer = document.getElementById('daysContainer');
        if (daysContainer) {
            calendarObserver.observe(daysContainer, {
                childList: true,
                subtree: true
            });
        }
        
        console.log('✅ 초기화 완료');
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('✅ 모달 중앙 정렬 및 다크 모드 스크립트 로드 완료');
    
})();