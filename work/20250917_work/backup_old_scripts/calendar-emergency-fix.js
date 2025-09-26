// 달력 긴급 수정 스크립트 - 스크립트 충돌 해결

(function() {
    'use strict';
    
    console.log('🚨 긴급 수정 스크립트 시작');
    
    // 초기화 지연을 위한 플래그
    let isFixed = false;
    
    function emergencyFix() {
        if (isFixed) return;
        isFixed = true;
        
        console.log('🔧 달력 수정 시작...');
        
        // 1. 날짜 표시 강제 복구
        fixDateDisplay();
        
        // 2. CSS 적용 강제
        applyCriticalCSS();
        
        // 3. 이벤트 재바인딩
        rebindEvents();
        
        console.log('✅ 달력 수정 완료');
    }
    
    function fixDateDisplay() {
        const days = document.querySelectorAll('.day');
        days.forEach((day, index) => {
            // 날짜 숫자 찾기
            const textContent = day.textContent.trim();
            const dayNumber = textContent.match(/\d+/);
            
            if (dayNumber && dayNumber[0]) {
                // 기존 내용 정리
                day.innerHTML = '';
                
                // 날짜 숫자 생성
                const dateSpan = document.createElement('span');
                dateSpan.className = 'day-number';
                dateSpan.textContent = dayNumber[0];
                dateSpan.style.cssText = `
                    color: #ffffff !important;
                    font-size: 28px !important;
                    font-weight: 700 !important;
                    display: block !important;
                    margin-bottom: 8px !important;
                `;
                day.appendChild(dateSpan);
                
                // 공휴일 체크 및 표시
                checkAndDisplayHoliday(day, parseInt(dayNumber[0]));
            }
        });
    }
    
    function checkAndDisplayHoliday(dayElement, dayNumber) {
        // 간단한 공휴일 체크 (8월 기준)
        const holidays = {
            15: '광복절'
        };
        
        if (holidays[dayNumber]) {
            dayElement.classList.add('holiday');
            
            // 날짜 숫자를 빨간색으로
            const dateSpan = dayElement.querySelector('.day-number');
            if (dateSpan) {
                dateSpan.style.color = '#ff4444 !important';
            }
            
            // 공휴일 이름 추가
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holidays[dayNumber];
            holidayName.style.cssText = `
                color: #ff4444 !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                background: rgba(255, 68, 68, 0.2) !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                margin-top: 4px !important;
                display: inline-block !important;
            `;
            dayElement.appendChild(holidayName);
        }
        
        // 주말 체크
        const allDays = Array.from(document.querySelectorAll('.day'));
        const dayIndex = allDays.indexOf(dayElement);
        const dayOfWeek = dayIndex % 7;
        
        if (dayOfWeek === 0) { // 일요일
            const dateSpan = dayElement.querySelector('.day-number');
            if (dateSpan && !dayElement.classList.contains('holiday')) {
                dateSpan.style.color = '#ff6b6b !important';
            }
        } else if (dayOfWeek === 6) { // 토요일
            const dateSpan = dayElement.querySelector('.day-number');
            if (dateSpan && !dayElement.classList.contains('holiday')) {
                dateSpan.style.color = '#4dabf7 !important';
            }
        }
    }
    
    function applyCriticalCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* 긴급 수정 CSS */
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: #ffffff !important;
            }
            
            .container {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 20px !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
            }
            
            .day {
                background: rgba(255, 255, 255, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                min-height: 100px !important;
                padding: 15px !important;
                transition: all 0.3s ease !important;
                color: #ffffff !important;
            }
            
            .day:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
            }
            
            .day.today {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border: 2px solid #ffffff !important;
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.6) !important;
            }
            
            #monthYear {
                color: #ffffff !important;
                font-size: 32px !important;
                font-weight: 700 !important;
            }
            
            .calendar-header {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 15px !important;
                padding: 20px !important;
                margin-bottom: 20px !important;
            }
            
            .calendar-header button {
                background: rgba(255, 255, 255, 0.2) !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                border-radius: 50% !important;
                width: 45px !important;
                height: 45px !important;
                font-size: 20px !important;
            }
            
            .weekday {
                color: #ffffff !important;
                font-weight: 700 !important;
                font-size: 14px !important;
                padding: 15px !important;
                background: rgba(255, 255, 255, 0.1) !important;
                border-radius: 8px !important;
                margin-bottom: 10px !important;
            }
            
            .days {
                gap: 8px !important;
                padding: 10px !important;
            }
            
            /* 버튼 스타일 */
            button {
                background: rgba(255, 255, 255, 0.2) !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                padding: 10px 16px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            }
            
            button:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                transform: translateY(-2px) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    function rebindEvents() {
        // 테마 토글 버튼 재생성
        const existingToggle = document.querySelector('.theme-toggle-container');
        if (existingToggle) {
            existingToggle.remove();
        }
        
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        toggleContainer.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            z-index: 9999 !important;
        `;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle-btn';
        toggleBtn.innerHTML = '<span class="theme-icon">🌙</span>';
        toggleBtn.style.cssText = `
            width: 60px !important;
            height: 60px !important;
            border-radius: 50% !important;
            background: rgba(255, 255, 255, 0.9) !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            cursor: pointer !important;
            font-size: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        `;
        
        toggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            
            if (newTheme === 'dark') {
                toggleBtn.innerHTML = '<span class="theme-icon">☀️</span>';
                document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important';
            } else {
                toggleBtn.innerHTML = '<span class="theme-icon">🌙</span>';
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important';
            }
            
            localStorage.setItem('theme', newTheme);
        });
        
        toggleContainer.appendChild(toggleBtn);
        document.body.appendChild(toggleContainer);
    }
    
    // 여러 시점에서 수정 시도
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(emergencyFix, 100);
        });
    } else {
        setTimeout(emergencyFix, 100);
    }
    
    // 추가 보험
    setTimeout(emergencyFix, 500);
    setTimeout(emergencyFix, 1000);
    setTimeout(emergencyFix, 2000);
    
})();