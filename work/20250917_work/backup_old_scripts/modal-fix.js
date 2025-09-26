// 모달 수정 및 크기 조절 기능 개선

(function() {
    'use strict';
    
    // DOM 로드 완료 후 실행
    function initModalFixes() {
        // 레이아웃 모달의 글자 크기 슬라이더 기능 수정
        fixFontSizeControls();
        
        // 모든 모달의 기본 기능 보장
        ensureModalBasicFunctions();
        
        // 테마 모달 기능 수정
        fixThemeModal();
    }
    
    function fixFontSizeControls() {
        // 년도 글자 크기 슬라이더
        const yearFontSlider = document.getElementById('yearFontSize');
        const yearFontValueSpan = document.getElementById('yearFontSizeValue');
        
        if (yearFontSlider && yearFontValueSpan) {
            yearFontSlider.addEventListener('input', function() {
                const value = this.value + 'px';
                yearFontValueSpan.textContent = value;
                
                // 실시간 적용
                const yearElement = document.getElementById('monthYear');
                if (yearElement) {
                    yearElement.style.fontSize = value;
                }
            });
        }
        
        // 일자 글자 크기 슬라이더
        const dateFontSlider = document.getElementById('dateFontSize');
        const dateFontValueSpan = document.getElementById('dateFontSizeValue');
        
        if (dateFontSlider && dateFontValueSpan) {
            dateFontSlider.addEventListener('input', function() {
                const value = this.value + 'px';
                dateFontValueSpan.textContent = value;
                
                // 모든 날짜 요소에 적용
                const dayElements = document.querySelectorAll('.day');
                dayElements.forEach(day => {
                    const dayContent = day.querySelector('*') || day;
                    dayContent.style.fontSize = value;
                });
            });
        }
        
        // 공휴일 글자 크기 슬라이더
        const holidayFontSlider = document.getElementById('holidayFontSize');
        const holidayFontValueSpan = document.getElementById('holidayFontSizeValue');
        
        if (holidayFontSlider && holidayFontValueSpan) {
            holidayFontSlider.addEventListener('input', function() {
                const value = this.value + 'px';
                holidayFontValueSpan.textContent = value;
                
                // 공휴일 텍스트에 적용 (실제 공휴일 표시가 있을 경우)
                const holidayElements = document.querySelectorAll('.holiday-text, .day .holiday');
                holidayElements.forEach(elem => {
                    elem.style.fontSize = value;
                });
            });
        }
        
        // 달력 너비 슬라이더
        const widthSlider = document.getElementById('calendarWidth');
        const widthValueSpan = document.getElementById('widthValue');
        
        if (widthSlider && widthValueSpan) {
            widthSlider.addEventListener('input', function() {
                const value = this.value + 'px';
                widthValueSpan.textContent = value;
                
                // 컨테이너 너비 적용
                const container = document.querySelector('.container');
                if (container) {
                    container.style.maxWidth = value;
                    container.style.width = value;
                }
            });
        }
        
        // 셀 높이 슬라이더
        const heightSlider = document.getElementById('cellHeight');
        const heightValueSpan = document.getElementById('heightValue');
        
        if (heightSlider && heightValueSpan) {
            heightSlider.addEventListener('input', function() {
                const value = this.value + 'px';
                heightValueSpan.textContent = value;
                
                // 모든 날짜 셀 높이 적용
                const style = document.createElement('style');
                style.textContent = `.day { min-height: ${value} !important; }`;
                document.head.appendChild(style);
            });
        }
    }
    
    function ensureModalBasicFunctions() {
        // 모든 모달 닫기 버튼 기능 보장
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('close') || e.target.textContent === '×') {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="block"]');
                openModals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
        
        // 모달 배경 클릭으로 닫기
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    function fixThemeModal() {
        // 테마 모달 열기 기능
        const themeButtons = document.querySelectorAll('button[title*="테마"], button[title*="theme"]');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const themeModal = document.getElementById('themeModal');
                if (themeModal) {
                    themeModal.style.display = 'block';
                }
            });
        });
        
        // 레이아웃 모달 열기 기능
        const layoutButtons = document.querySelectorAll('button[title*="레이아웃"], button[title*="layout"]');
        layoutButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const layoutModal = document.getElementById('layoutModal');
                if (layoutModal) {
                    layoutModal.style.display = 'block';
                }
            });
        });
    }
    
    // 초기화 함수 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalFixes);
    } else {
        initModalFixes();
    }
    
    // 추가적인 초기화를 위한 지연 실행
    setTimeout(initModalFixes, 1000);
    
})();