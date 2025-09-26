// 설정 모달 내부 모든 컨트롤 요소 클릭/이벤트 문제 해결
// Framework7 환경에서 설정 모달의 모든 기능을 정상 작동시키는 스크립트

(function() {
    'use strict';
    
    console.log('🛠️ 설정 모달 컨트롤 수정 스크립트 시작');
    
    let isInitialized = false;
    
    // Framework7 앱과 DOM7 확인
    function waitForDependencies() {
        return new Promise((resolve) => {
            const check = () => {
                const $$ = window.$$ || window.jQuery || window.$;
                if ($$) {
                    resolve($$);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
    
    // 메인 초기화 함수
    async function initSettingsModalFix() {
        if (isInitialized) return;
        
        const $$ = await waitForDependencies();
        console.log('✅ 설정 모달 컨트롤 수정 초기화 시작');
        
        // 1. 알림 권한 요청 버튼 수정
        function fixNotificationButton() {
            $$(document).off('click', 'button[onclick*="requestNotificationPermission"]');
            $$(document).on('click', 'button[onclick*="requestNotificationPermission"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔔 알림 권한 요청 버튼 클릭됨');
                
                if (typeof window.requestNotificationPermission === 'function') {
                    window.requestNotificationPermission();
                } else {
                    // 백업 구현
                    if ('Notification' in window) {
                        Notification.requestPermission().then(function(permission) {
                            const statusEl = document.getElementById('notificationStatus');
                            if (statusEl) {
                                if (permission === 'granted') {
                                    statusEl.innerHTML = '✅ 허용됨';
                                    statusEl.className = 'status-indicator success';
                                } else {
                                    statusEl.innerHTML = '❌ 거부됨';
                                    statusEl.className = 'status-indicator error';
                                }
                            }
                        });
                    }
                }
            });
            
            console.log('✅ 알림 권한 버튼 이벤트 수정 완료');
        }
        
        // 2. 글꼴 크기 조절 버튼들 수정
        function fixFontSizeButtons() {
            // 글꼴 크기 조절 버튼들
            $$(document).off('click', 'button[onclick*="adjustFontSize"]');
            $$(document).on('click', 'button[onclick*="adjustFontSize"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const onclickAttr = $$(this).attr('onclick');
                const delta = onclickAttr.includes('-0.1') ? -0.1 : 0.1;
                
                console.log('🔤 글꼴 크기 조절 버튼 클릭:', delta);
                
                if (typeof window.adjustFontSize === 'function') {
                    window.adjustFontSize(delta);
                } else {
                    // 백업 구현
                    const slider = document.getElementById('fontSizeSlider');
                    if (slider) {
                        const currentValue = parseFloat(slider.value);
                        const newValue = Math.max(0.7, Math.min(1.5, currentValue + delta));
                        slider.value = newValue;
                        
                        // 디스플레이 업데이트
                        const display = document.getElementById('fontSizeDisplay');
                        if (display) {
                            display.textContent = Math.round(newValue * 100) + '%';
                        }
                        
                        // 실제 적용
                        document.documentElement.style.setProperty('--font-scale', newValue.toString());
                        
                        // 입력 이벤트 트리거
                        slider.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });
            
            console.log('✅ 글꼴 크기 조절 버튼 이벤트 수정 완료');
        }
        
        // 3. 일자 크기 조절 버튼들 수정
        function fixDateSizeButtons() {
            $$(document).off('click', 'button[onclick*="adjustDateSize"]');
            $$(document).on('click', 'button[onclick*="adjustDateSize"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const onclickAttr = $$(this).attr('onclick');
                const delta = onclickAttr.includes('-0.1') ? -0.1 : 0.1;
                
                console.log('📅 일자 크기 조절 버튼 클릭:', delta);
                
                if (typeof window.adjustDateSize === 'function') {
                    window.adjustDateSize(delta);
                } else {
                    // 백업 구현
                    const slider = document.getElementById('dateSizeSlider');
                    if (slider) {
                        const currentValue = parseFloat(slider.value);
                        const newValue = Math.max(0.7, Math.min(1.8, currentValue + delta));
                        slider.value = newValue;
                        
                        // 디스플레이 업데이트
                        const display = document.getElementById('dateSizeDisplay');
                        if (display) {
                            display.textContent = Math.round(newValue * 100) + '%';
                        }
                        
                        // 실제 적용
                        document.documentElement.style.setProperty('--date-scale', newValue.toString());
                        
                        // 입력 이벤트 트리거
                        slider.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });
            
            console.log('✅ 일자 크기 조절 버튼 이벤트 수정 완료');
        }
        
        // 4. 달력 크기 조절 버튼들 수정
        function fixCalendarSizeButtons() {
            $$(document).off('click', 'button[onclick*="adjustCalendarSize"]');
            $$(document).on('click', 'button[onclick*="adjustCalendarSize"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const onclickAttr = $$(this).attr('onclick');
                const isWidth = onclickAttr.includes("'width'");
                const delta = onclickAttr.includes('-0.1') ? -0.1 : 0.1;
                const dimension = isWidth ? 'width' : 'height';
                
                console.log('📏 달력 크기 조절 버튼 클릭:', dimension, delta);
                
                if (typeof window.adjustCalendarSize === 'function') {
                    window.adjustCalendarSize(dimension, delta);
                } else {
                    // 백업 구현
                    const sliderId = isWidth ? 'widthSlider' : 'heightSlider';
                    const displayId = isWidth ? 'widthDisplay' : 'heightDisplay';
                    const slider = document.getElementById(sliderId);
                    
                    if (slider) {
                        const currentValue = parseFloat(slider.value);
                        const newValue = Math.max(0.5, Math.min(2.0, currentValue + delta));
                        slider.value = newValue;
                        
                        // 디스플레이 업데이트
                        const display = document.getElementById(displayId);
                        if (display) {
                            display.textContent = Math.round(newValue * 100) + '%';
                        }
                        
                        // 실제 적용
                        const widthSlider = document.getElementById('widthSlider');
                        const heightSlider = document.getElementById('heightSlider');
                        if (widthSlider && heightSlider) {
                            const widthValue = widthSlider.value;
                            const heightValue = heightSlider.value;
                            document.documentElement.style.setProperty('--width-scale', widthValue);
                            document.documentElement.style.setProperty('--height-scale', heightValue);
                        }
                        
                        // 입력 이벤트 트리거
                        slider.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });
            
            console.log('✅ 달력 크기 조절 버튼 이벤트 수정 완료');
        }
        
        // 5. 슬라이더 이벤트 강화
        function fixSliderEvents() {
            // 모든 설정 슬라이더에 대한 이벤트 처리
            const sliders = [
                { id: 'fontSizeSlider', display: 'fontSizeDisplay', property: '--font-scale', min: 0.7, max: 1.5 },
                { id: 'dateSizeSlider', display: 'dateSizeDisplay', property: '--date-scale', min: 0.7, max: 1.8 },
                { id: 'widthSlider', display: 'widthDisplay', property: '--width-scale', min: 0.5, max: 2.0 },
                { id: 'heightSlider', display: 'heightDisplay', property: '--height-scale', min: 0.5, max: 2.0 }
            ];
            
            sliders.forEach(slider => {
                const element = document.getElementById(slider.id);
                if (element) {
                    // 기존 이벤트 제거
                    $$(element).off('input change');
                    
                    // 새 이벤트 추가
                    $$(element).on('input', function() {
                        const value = parseFloat(this.value);
                        const clampedValue = Math.max(slider.min, Math.min(slider.max, value));
                        
                        // 디스플레이 업데이트
                        const display = document.getElementById(slider.display);
                        if (display) {
                            display.textContent = Math.round(clampedValue * 100) + '%';
                        }
                        
                        // CSS 변수 적용
                        document.documentElement.style.setProperty(slider.property, clampedValue.toString());
                        
                        console.log(`🎚️ ${slider.id} 변경:`, clampedValue);
                        
                        // 특별 처리가 필요한 경우
                        if (slider.id === 'widthSlider' || slider.id === 'heightSlider') {
                            const widthSlider = document.getElementById('widthSlider');
                            const heightSlider = document.getElementById('heightSlider');
                            if (widthSlider && heightSlider && typeof window.applyCalendarSize === 'function') {
                                window.applyCalendarSize(widthSlider.value, heightSlider.value);
                            }
                        } else if (slider.id === 'fontSizeSlider' && typeof window.applyFontSize === 'function') {
                            window.applyFontSize(clampedValue);
                        } else if (slider.id === 'dateSizeSlider' && typeof window.applyDateSize === 'function') {
                            window.applyDateSize(clampedValue);
                        }
                    });
                    
                    // change 이벤트도 처리 (일부 브라우저에서 필요)
                    $$(element).on('change', function() {
                        $$(this).trigger('input');
                    });
                }
            });
            
            console.log('✅ 슬라이더 이벤트 수정 완료');
        }
        
        // 6. 드롭다운/셀렉트 이벤트 강화
        function fixSelectEvents() {
            // 테마 선택
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                $$(themeSelect).off('change');
                $$(themeSelect).on('change', function() {
                    const theme = this.value;
                    document.documentElement.setAttribute('data-theme', theme);
                    
                    // 테마 토글 버튼 업데이트
                    const themeToggle = document.getElementById('themeToggle');
                    if (themeToggle) {
                        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
                    }
                    
                    console.log('🎨 테마 변경:', theme);
                });
            }
            
            // 주 시작일 선택
            const weekStartSelect = document.querySelector('#settingsModal select.form-select');
            if (weekStartSelect) {
                $$(weekStartSelect).off('change');
                $$(weekStartSelect).on('change', function() {
                    console.log('📅 주 시작일 변경:', this.value);
                    // 실제 적용은 저장 시에
                });
            }
            
            console.log('✅ 드롭다운 이벤트 수정 완료');
        }
        
        // 7. 설정 모달 열기/닫기 이벤트 강화
        function fixModalEvents() {
            // 설정 모달이 열릴 때마다 이벤트 재설정
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                // MutationObserver로 모달 표시 상태 감지
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            const display = settingsModal.style.display;
                            if (display === 'block' || display === 'flex') {
                                console.log('📱 설정 모달 열림 감지, 이벤트 재설정');
                                setTimeout(() => {
                                    fixAllControls();
                                }, 100);
                            }
                        }
                    });
                });
                
                observer.observe(settingsModal, { 
                    attributes: true, 
                    attributeFilter: ['style', 'class'] 
                });
            }
            
            console.log('✅ 모달 이벤트 감지 설정 완료');
        }
        
        // 8. 터치 이벤트 지원
        function fixTouchEvents() {
            const clickableElements = [
                'button[onclick*="adjust"]',
                'button[onclick*="request"]',
                '#settingsModal input[type="range"]',
                '#settingsModal select'
            ];
            
            clickableElements.forEach(selector => {
                $$(document).on('touchstart', selector, function(e) {
                    // 터치 시작 시 active 상태 추가
                    $$(this).addClass('touching');
                });
                
                $$(document).on('touchend', selector, function(e) {
                    // 터치 종료 시 active 상태 제거
                    $$(this).removeClass('touching');
                    
                    // 버튼인 경우 클릭 이벤트 트리거
                    if (this.tagName === 'BUTTON') {
                        setTimeout(() => {
                            $$(this).trigger('click');
                        }, 10);
                    }
                });
            });
            
            console.log('✅ 터치 이벤트 지원 추가 완료');
        }
        
        // 모든 컨트롤 수정 실행
        function fixAllControls() {
            fixNotificationButton();
            fixFontSizeButtons();
            fixDateSizeButtons();
            fixCalendarSizeButtons();
            fixSliderEvents();
            fixSelectEvents();
            fixTouchEvents();
        }
        
        // 초기 실행
        fixAllControls();
        fixModalEvents();
        
        // 주기적 재설정 (동적 콘텐츠 대응)
        setInterval(fixAllControls, 3000);
        
        isInitialized = true;
        console.log('🎉 설정 모달 컨트롤 수정 완료');
    }
    
    // 다양한 시점에서 초기화 시도
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettingsModalFix);
    } else {
        initSettingsModalFix();
    }
    
    // 페이지 로드 완료 후에도 한 번 더 시도
    window.addEventListener('load', () => {
        setTimeout(initSettingsModalFix, 1000);
    });
    
    // Framework7 앱 준비 완료 시에도 시도
    document.addEventListener('DOMContentLoaded', () => {
        const checkFramework7 = () => {
            if (window.app) {
                if (window.app.on) {
                    window.app.on('modalOpen', () => {
                        setTimeout(initSettingsModalFix, 200);
                    });
                }
                initSettingsModalFix();
            } else {
                setTimeout(checkFramework7, 500);
            }
        };
        checkFramework7();
    });
    
})();