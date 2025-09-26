// Framework7 호환 버튼 클릭 이벤트 처리 개선 스크립트
// 설정 저장 및 클라우드 메뉴 저장 버튼 문제 해결

(function() {
    'use strict';
    
    console.log('🔧 Framework7 버튼 이벤트 처리 개선 시작');
    
    // Framework7 앱 인스턴스가 있는지 확인
    function waitForFramework7() {
        return new Promise((resolve) => {
            // Framework7 사용하지 않고 바로 진행
            console.log('✅ Framework7 의존성 제거, 기본 이벤트 처리로 진행');
            resolve(null);
        });
    }
    
    // 메인 초기화 함수
    async function initButtonFixes() {
        const app = await waitForFramework7();
        const $$ = window.$$ || window.jQuery || window.$;
        
        if (!$$) {
            console.error('❌ jQuery 또는 DOM7을 찾을 수 없습니다');
            return;
        }
        
        console.log('✅ Framework7 버튼 이벤트 처리 초기화 시작');
        
        // 1. 설정 저장 버튼 이벤트 강화
        function setupSettingsButtonEvents() {
            // 설정 모달 내의 저장 버튼들
            const settingsButtons = [
                'button[onclick*="saveSettings"]',
                '.btn-primary[onclick*="saveSettings"]',
                'button:contains("설정 저장")',
                'button:contains("저장")'
            ];
            
            settingsButtons.forEach(selector => {
                $$(document).off('click', selector); // 기존 이벤트 제거
                $$(document).on('click', selector, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('🖱️ 설정 저장 버튼 클릭됨 (Framework7 처리)');
                    
                    // 기존 saveSettings 함수 호출
                    if (typeof window.saveSettings === 'function') {
                        try {
                            window.saveSettings();
                        } catch (error) {
                            console.error('❌ 설정 저장 오류:', error);
                            if (app && app.dialog) {
                                app.dialog.alert('설정 저장 중 오류가 발생했습니다.', '오류');
                            } else {
                                alert('설정 저장 중 오류가 발생했습니다.');
                            }
                        }
                    } else {
                        console.error('❌ saveSettings 함수를 찾을 수 없습니다');
                        if (app && app.dialog) {
                            app.dialog.alert('설정 저장 기능을 찾을 수 없습니다.', '오류');
                        } else {
                            alert('설정 저장 기능을 찾을 수 없습니다.');
                        }
                    }
                });
            });
            
            console.log('✅ 설정 저장 버튼 이벤트 설정 완료');
        }
        
        // 2. 클라우드 설정 저장 버튼 이벤트 강화
        function setupCloudButtonEvents() {
            // API 설정 저장 버튼
            $$(document).off('click', 'button[onclick*="saveAPISettings"]');
            $$(document).on('click', 'button[onclick*="saveAPISettings"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ API 설정 저장 버튼 클릭됨 (Framework7 처리)');
                
                if (typeof window.saveAPISettings === 'function') {
                    try {
                        window.saveAPISettings();
                    } catch (error) {
                        console.error('❌ API 설정 저장 오류:', error);
                        showErrorMessage('API 설정 저장 중 오류가 발생했습니다.', app);
                    }
                } else {
                    console.error('❌ saveAPISettings 함수를 찾을 수 없습니다');
                    showErrorMessage('API 설정 저장 기능을 찾을 수 없습니다.', app);
                }
            });
            
            // 통합 설정 저장 버튼
            $$(document).off('click', 'button[onclick*="saveUnifiedSettings"]');
            $$(document).on('click', 'button[onclick*="saveUnifiedSettings"]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ 통합 설정 저장 버튼 클릭됨 (Framework7 처리)');
                
                if (typeof window.saveUnifiedSettings === 'function') {
                    try {
                        window.saveUnifiedSettings();
                    } catch (error) {
                        console.error('❌ 통합 설정 저장 오류:', error);
                        showErrorMessage('설정 저장 중 오류가 발생했습니다.', app);
                    }
                } else {
                    console.error('❌ saveUnifiedSettings 함수를 찾을 수 없습니다');
                    showErrorMessage('통합 설정 저장 기능을 찾을 수 없습니다.', app);
                }
            });
            
            console.log('✅ 클라우드 설정 저장 버튼 이벤트 설정 완료');
        }
        
        // 3. 모든 저장 관련 버튼에 대한 범용 이벤트 핸들러
        function setupGenericSaveButtons() {
            // 모든 "저장" 텍스트가 포함된 버튼에 대한 이벤트 핸들러
            $$(document).on('click', 'button, .btn, .button', function(e) {
                const buttonText = $$(this).text().trim();
                const onclickAttr = $$(this).attr('onclick') || '';
                
                // "저장" 텍스트가 포함되어 있거나 save 함수를 호출하는 버튼인지 확인
                if (buttonText.includes('저장') || onclickAttr.includes('save')) {
                    console.log('🔍 저장 버튼 감지:', buttonText, onclickAttr);
                    
                    // 버튼이 동작하지 않을 경우를 대비한 보조 처리
                    setTimeout(() => {
                        // onclick 속성이 있다면 강제로 실행
                        if (onclickAttr) {
                            try {
                                console.log('🔧 onclick 속성 강제 실행:', onclickAttr);
                                // onclick 함수 실행
                                const func = new Function(onclickAttr);
                                func.call(this);
                            } catch (error) {
                                console.error('❌ onclick 강제 실행 실패:', error);
                            }
                        }
                    }, 100);
                }
            });
            
            console.log('✅ 범용 저장 버튼 이벤트 설정 완료');
        }
        
        // 4. 터치/모바일 이벤트 지원 강화
        function setupTouchEvents() {
            // 터치 이벤트도 함께 처리
            const saveButtons = [
                'button[onclick*="saveSettings"]',
                'button[onclick*="saveAPISettings"]', 
                'button[onclick*="saveUnifiedSettings"]',
                '.btn-primary[onclick*="save"]'
            ];
            
            saveButtons.forEach(selector => {
                $$(document).on('touchend', selector, function(e) {
                    e.preventDefault();
                    const onclickAttr = $$(this).attr('onclick');
                    if (onclickAttr) {
                        console.log('👆 터치 이벤트로 저장 버튼 실행:', onclickAttr);
                        setTimeout(() => {
                            try {
                                const func = new Function(onclickAttr);
                                func.call(this);
                            } catch (error) {
                                console.error('❌ 터치 이벤트 처리 실패:', error);
                            }
                        }, 50);
                    }
                });
            });
            
            console.log('✅ 터치 이벤트 지원 설정 완료');
        }
        
        // 5. 모달 관련 이벤트 최적화
        function setupModalEvents() {
            if (app && app.on) {
                // 모달이 열릴 때 버튼 이벤트 재설정
                app.on('modalOpen', function(modal) {
                    console.log('📱 모달 열림, 버튼 이벤트 재설정');
                    setTimeout(() => {
                        setupSettingsButtonEvents();
                        setupCloudButtonEvents();
                    }, 100);
                });
                
                // 페이지 변경 시 이벤트 재설정
                app.on('pageInit', function(page) {
                    console.log('📄 페이지 초기화, 버튼 이벤트 재설정');
                    setTimeout(() => {
                        setupSettingsButtonEvents();
                        setupCloudButtonEvents();
                    }, 100);
                });
            }
            
            console.log('✅ 모달 이벤트 최적화 완료');
        }
        
        // 모든 이벤트 설정 실행
        setupSettingsButtonEvents();
        setupCloudButtonEvents();
        setupGenericSaveButtons();
        setupTouchEvents();
        setupModalEvents();
        
        // 주기적으로 이벤트 재설정 (동적 콘텐츠 대응)
        setInterval(() => {
            setupSettingsButtonEvents();
            setupCloudButtonEvents();
        }, 5000);
        
        console.log('🎉 Framework7 버튼 이벤트 처리 개선 완료');
    }
    
    // 오류 메시지 표시 함수
    function showErrorMessage(message, app) {
        if (app && app.dialog && app.dialog.alert) {
            app.dialog.alert(message, '오류');
        } else if (app && app.notification && app.notification.create) {
            const notification = app.notification.create({
                text: message,
                closeTimeout: 3000,
                closeOnClick: true
            });
            notification.open();
        } else {
            alert(message);
        }
    }
    
    // DOM 준비 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButtonFixes);
    } else {
        initButtonFixes();
    }
    
    // Framework7 앱이 나중에 로드될 경우를 대비
    window.addEventListener('load', () => {
        setTimeout(initButtonFixes, 1000);
    });
    
})();