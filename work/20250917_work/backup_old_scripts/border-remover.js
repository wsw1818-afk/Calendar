// 달력 테두리 완전 제거 스크립트

(function() {
    'use strict';
    
    function removeBorders() {
        // 모든 달력 관련 요소 찾기
        const dayElements = document.querySelectorAll('.day, .days .day, .calendar .day, div.day, [class*="day"]');
        
        dayElements.forEach(element => {
            // 인라인 스타일로 강제 제거
            element.style.border = 'none';
            element.style.borderTop = 'none';
            element.style.borderRight = 'none';
            element.style.borderBottom = 'none';
            element.style.borderLeft = 'none';
            element.style.borderWidth = '0';
            element.style.borderStyle = 'none';
            element.style.borderColor = 'transparent';
            element.style.outline = 'none';
            element.style.boxShadow = 'none';
        });
        
        // days 컨테이너도 처리
        const daysContainer = document.querySelector('.days');
        if (daysContainer) {
            daysContainer.style.border = 'none';
            daysContainer.style.gap = '0';
        }
        
        // 전체 달력 컨테이너
        const calendar = document.querySelector('.calendar');
        if (calendar) {
            calendar.style.border = 'none';
        }
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeBorders);
    } else {
        removeBorders();
    }
    
    // 추가 실행 (달력이 동적으로 생성되는 경우 대비)
    setTimeout(removeBorders, 100);
    setTimeout(removeBorders, 500);
    setTimeout(removeBorders, 1000);
    
    // MutationObserver로 동적 변경 감지
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                setTimeout(removeBorders, 50);
            }
        });
    });
    
    // 관찰 시작
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
})();