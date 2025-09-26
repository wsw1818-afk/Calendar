/**
 * 최종 안정화 수정
 * - 모든 메뉴 복구
 * - 미리보기 기능 유지
 * - 클릭 문제 해결
 */

(function() {
    'use strict';
    
    console.log('🎯 최종 안정화 수정 시작');
    
    // ========== 1. 전역 상태 관리 ==========
    window.FinalStableSystem = {
        previewActive: false,
        previewScale: 0.8,
        menuClickEnabled: true,
        lastModalOpened: null
    };
    
    // ========== 2. 메뉴 버튼 확인 및 복구 ==========
    function checkAndRestoreMenus() {
        console.log('🔍 메뉴 버튼 확인 및 복구');
        
        // 필수 메뉴 버튼 목록
        const requiredMenus = [
            { id: 'fontSizeDetailBtn', text: '📝 글자 크기', handler: 'openFontSizeModal' },
            { id: 'colorModeDetailBtn', text: '🎨 색상 모드', handler: 'openColorModeModal' },
            { id: 'themeBtn', text: '🎨 테마' },
            { id: 'layoutBtn', text: '📐 레이아웃' },
            { id: 'stickerBtn', text: '📝 스티커' },
            { id: 'excelBtn', text: '📊 엑셀' },
            { id: 'googleDriveBtn', text: '☁️ 구글 드라이브' }
        ];
        
        let missingCount = 0;
        
        requiredMenus.forEach(menu => {
            const btn = document.getElementById(menu.id);
            if (!btn) {
                console.warn(`⚠️ ${menu.text} 버튼 없음`);
                missingCount++;
                
                // 버튼 복구 시도
                let menuContainer = document.querySelector('.floating-menu, .menu-container, .controls');
                
                // 컨테이너가 없으면 생성
                if (!menuContainer) {
                    menuContainer = document.createElement('div');
                    menuContainer.className = 'floating-menu';
                    menuContainer.style.cssText = `
                        position: fixed;
                        top: 20px;
                        left: 20px;
                        z-index: 1000;
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    `;
                    document.body.appendChild(menuContainer);
                    console.log('메뉴 컨테이너 생성');
                }
                
                if (menu.handler) {
                    const newBtn = document.createElement('button');
                    newBtn.id = menu.id;
                    newBtn.className = 'menu-btn';
                    newBtn.textContent = menu.text;
                    newBtn.style.cssText = `
                        padding: 10px 15px;
                        border: none;
                        border-radius: 8px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
                        transition: all 0.3s ease;
                    `;
                    newBtn.onmouseover = () => {
                        newBtn.style.transform = 'translateY(-2px)';
                        newBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    };
                    newBtn.onmouseout = () => {
                        newBtn.style.transform = 'translateY(0)';
                        newBtn.style.boxShadow = '0 2px 10px rgba(102, 126, 234, 0.3)';
                    };
                    newBtn.onclick = function() {
                        if (window.AdvancedControls && window.AdvancedControls[menu.handler]) {
                            window.AdvancedControls[menu.handler]();
                        }
                    };
                    menuContainer.appendChild(newBtn);
                    console.log(`✅ ${menu.text} 버튼 복구됨`);
                }
            } else {
                console.log(`✅ ${menu.text} 버튼 존재`);
                
                // 중복 제거
                const duplicates = document.querySelectorAll(`#${menu.id}`);
                if (duplicates.length > 1) {
                    for (let i = 1; i < duplicates.length; i++) {
                        duplicates[i].remove();
                    }
                    console.log(`${menu.text} 중복 ${duplicates.length - 1}개 제거`);
                }
            }
        });
        
        if (missingCount === 0) {
            console.log('✅ 모든 메뉴 버튼 정상');
        } else {
            console.warn(`⚠️ ${missingCount}개 메뉴 복구 시도됨`);
        }
    }
    
    // ========== 3. 안전한 미리보기 시스템 ==========
    function setupSafePreview() {
        console.log('🔍 안전한 미리보기 설정');
        
        // 미리보기 활성화
        window.safeEnablePreview = function() {
            if (window.FinalStableSystem.previewActive) {
                console.log('미리보기 이미 활성화됨');
                return;
            }
            
            console.log('🔍 안전한 미리보기 활성화');
            
            // body는 그대로, container만 scale
            const container = document.querySelector('.container');
            if (container) {
                container.style.transition = 'transform 0.3s ease';
                container.style.transform = `scale(${window.FinalStableSystem.previewScale})`;
                container.style.transformOrigin = 'top center';
                
                // 스케일된 크기에 맞게 너비 조정
                container.style.width = `${100 / window.FinalStableSystem.previewScale}%`;
                container.style.maxWidth = 'none';
                container.style.margin = '0 auto';
            }
            
            // 모달과 메뉴는 스케일 영향 안받게
            document.querySelectorAll('.modal, .modal-content, .floating-menu, .menu-btn').forEach(elem => {
                elem.style.position = elem.style.position || 'fixed';
                elem.style.zIndex = '10000';
                elem.style.pointerEvents = 'auto';
            });
            
            window.FinalStableSystem.previewActive = true;
            
            // 미리보기 표시
            showPreviewBadge();
        };
        
        // 미리보기 비활성화
        window.safeDisablePreview = function() {
            if (!window.FinalStableSystem.previewActive) {
                console.log('미리보기 이미 비활성화됨');
                return;
            }
            
            console.log('❌ 안전한 미리보기 비활성화');
            
            const container = document.querySelector('.container');
            if (container) {
                container.style.transform = 'none';
                container.style.width = '';
                container.style.maxWidth = '';
            }
            
            window.FinalStableSystem.previewActive = false;
            
            // 표시 제거
            hidePreviewBadge();
        };
        
        // 기존 시스템 오버라이드
        if (window.PreviewControl) {
            window.PreviewControl.enable = window.safeEnablePreview;
            window.PreviewControl.disable = window.safeDisablePreview;
            window.PreviewControl.isEnabled = () => window.FinalStableSystem.previewActive;
        }
        
        if (window.toggleSafePreview) {
            const original = window.toggleSafePreview;
            window.toggleSafePreview = function(enable) {
                if (enable) {
                    window.safeEnablePreview();
                } else {
                    window.safeDisablePreview();
                }
            };
        }
    }
    
    // ========== 4. 미리보기 표시 ==========
    function showPreviewBadge() {
        hidePreviewBadge();
        
        const badge = document.createElement('div');
        badge.id = 'previewBadge';
        badge.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            z-index: 100001;
            pointer-events: none;
            box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
        `;
        badge.textContent = `미리보기 ${Math.round(window.FinalStableSystem.previewScale * 100)}%`;
        document.body.appendChild(badge);
    }
    
    function hidePreviewBadge() {
        const badge = document.getElementById('previewBadge');
        if (badge) badge.remove();
    }
    
    // ========== 5. 모달 열기 감지 및 미리보기 자동 관리 ==========
    function setupModalDetection() {
        console.log('📝 모달 감지 설정');
        
        // MutationObserver로 모달 감지
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.id) {
                        // 글자/색상 모달 열림
                        if (node.id === 'fontSizeModal' || node.id === 'colorModeModal') {
                            console.log(`${node.id} 열림 감지`);
                            window.FinalStableSystem.lastModalOpened = node.id;
                            
                            // 미리보기 자동 활성화 (약간 지연)
                            setTimeout(() => {
                                if (!window.FinalStableSystem.previewActive) {
                                    window.safeEnablePreview();
                                }
                            }, 100);
                        }
                    }
                });
                
                mutation.removedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.id) {
                        // 모달 닫힘
                        if (node.id === window.FinalStableSystem.lastModalOpened) {
                            console.log(`${node.id} 닫힘 감지`);
                            
                            // 미리보기 자동 비활성화
                            setTimeout(() => {
                                if (window.FinalStableSystem.previewActive) {
                                    window.safeDisablePreview();
                                }
                            }, 100);
                            
                            window.FinalStableSystem.lastModalOpened = null;
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
    }
    
    // ========== 6. 클릭 이벤트 보호 ==========
    function protectMenuClicks() {
        console.log('🛡️ 메뉴 클릭 보호');
        
        // 메뉴 버튼들이 항상 클릭 가능하도록
        const protectButtons = () => {
            document.querySelectorAll('.menu-btn, .control-btn, button').forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.position = btn.style.position || 'relative';
                btn.style.zIndex = btn.style.zIndex || '9999';
            });
        };
        
        // 초기 보호
        protectButtons();
        
        // 주기적 보호 (5초마다)
        setInterval(protectButtons, 5000);
    }
    
    // ========== 7. 안전한 ESC 키 핸들러 ==========
    function setupSafeEscHandler() {
        console.log('⌨️ 안전한 ESC 키 핸들러 설정');
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                console.log('ESC 키 감지');
                
                // 활성 모달 찾기
                const modals = document.querySelectorAll('.modal:not([style*="display: none"])');
                let closed = false;
                
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        console.log(`모달 닫기: ${modal.id}`);
                        modal.style.display = 'none';
                        closed = true;
                        
                        // 미리보기도 비활성화
                        if (window.FinalStableSystem.previewActive) {
                            window.safeDisablePreview();
                        }
                    }
                });
                
                if (closed) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    }
    
    // ========== 8. 시스템 상태 모니터링 ==========
    function systemStatus() {
        console.log('\n=== 📊 시스템 상태 ===');
        
        const status = {
            '미리보기': window.FinalStableSystem.previewActive ? '활성' : '비활성',
            '미리보기 스케일': Math.round(window.FinalStableSystem.previewScale * 100) + '%',
            '열린 모달': window.FinalStableSystem.lastModalOpened || '없음',
            '메뉴 버튼': {
                '글자 크기': document.getElementById('fontSizeDetailBtn') ? '✅' : '❌',
                '색상 모드': document.getElementById('colorModeDetailBtn') ? '✅' : '❌',
                '테마': document.getElementById('themeBtn') ? '✅' : '❌',
                '레이아웃': document.getElementById('layoutBtn') ? '✅' : '❌',
                '스티커': document.getElementById('stickerBtn') ? '✅' : '❌',
                '엑셀': document.getElementById('excelBtn') ? '✅' : '❌',
                '구글 드라이브': document.getElementById('googleDriveBtn') ? '✅' : '❌'
            }
        };
        
        console.table(status);
        console.log('==================\n');
        
        return status;
    }
    
    // ========== 8. 기존 시스템 비활성화 ==========
    function disableConflictingSystems() {
        console.log('🚫 충돌 시스템 비활성화');
        
        // preview-control.js 완전 비활성화
        if (window.PreviewControl) {
            window.PreviewControl.enable = function() { 
                console.log('PreviewControl.enable 비활성화됨');
                return false; 
            };
            window.PreviewControl.disable = function() { 
                console.log('PreviewControl.disable 비활성화됨');
                return false; 
            };
            window.PreviewControl.isEnabled = function() { return false; };
            window.PreviewControl.setupModalObserver = function() {};
            window.PreviewControl.setupModalControls = function() {};
        }
        
        // preview-mode-fix.js 비활성화
        if (window.toggleSafePreview) {
            window._originalToggleSafePreview = window.toggleSafePreview;
            window.toggleSafePreview = function() {
                console.log('toggleSafePreview 비활성화됨');
                return false;
            };
        }
        
        // ultimate-fix.js 비활성화
        if (window.ultimateFix) {
            delete window.ultimateFix;
        }
        if (window.UnifiedPreviewSystem) {
            delete window.UnifiedPreviewSystem;
        }
        
        // 클릭 좌표 보정 제거 (getEventListeners는 Chrome DevTools에서만 사용 가능)
        try {
            if (typeof getEventListeners !== 'undefined') {
                const oldListeners = getEventListeners(document);
                if (oldListeners && oldListeners.click) {
                    oldListeners.click.forEach(listener => {
                        if (listener.listener.toString().includes('클릭 좌표 보정')) {
                            document.removeEventListener('click', listener.listener, true);
                        }
                    });
                }
            }
        } catch (e) {
            // getEventListeners 사용 불가 - 무시
        }
        
        // 모든 미리보기 클래스 제거
        document.body.classList.remove('preview-mode', 'safe-preview-mode');
        document.body.style.transform = 'none';
        document.body.style.width = '';
        document.body.style.height = '';
        
        console.log('✅ 충돌 시스템 비활성화 완료');
    }
    
    // ========== 9. 초기화 ==========
    function init() {
        console.log('🚀 최종 안정화 초기화');
        
        // 0. 충돌 시스템 비활성화 (가장 먼저!)
        disableConflictingSystems();
        
        // 1. 메뉴 확인 및 복구
        checkAndRestoreMenus();
        
        // 2. 안전한 미리보기 설정
        setupSafePreview();
        
        // 3. 모달 감지 설정
        setupModalDetection();
        
        // 4. 메뉴 클릭 보호
        protectMenuClicks();
        
        // 5. 안전한 ESC 핸들러 설정
        setupSafeEscHandler();
        
        // 6. 3초 후 상태 확인
        setTimeout(systemStatus, 3000);
        
        console.log('✅ 최종 안정화 완료');
    }
    
    // DOM 준비 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
    
    // 전역 유틸리티
    window.finalStable = {
        status: systemStatus,
        preview: {
            enable: window.safeEnablePreview,
            disable: window.safeDisablePreview,
            toggle: () => window.FinalStableSystem.previewActive ? 
                       window.safeDisablePreview() : window.safeEnablePreview(),
            setScale: (scale) => {
                if (scale >= 0.3 && scale <= 1) {
                    window.FinalStableSystem.previewScale = scale;
                    if (window.FinalStableSystem.previewActive) {
                        window.safeDisablePreview();
                        window.safeEnablePreview();
                    }
                }
            }
        },
        checkMenus: checkAndRestoreMenus
    };
    
    console.log('✅ 최종 안정화 로드 완료');
    console.log('💡 상태: finalStable.status()');
    console.log('💡 메뉴 확인: finalStable.checkMenus()');
    console.log('💡 미리보기: finalStable.preview.toggle()');
    
})();