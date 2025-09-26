/**
 * 최종 통합 수정 스크립트
 * - 모든 타이밍 문제 해결
 * - emergency-font-modal-fix.js 비활성화
 * - 미리보기 모드 완전 통합
 */

(function() {
    'use strict';
    
    console.log('🚀 최종 통합 수정 시작 (ULTIMATE FIX)');
    
    // ========== 1. Emergency Font Modal Fix 비활성화 ==========
    function disableEmergencyFix() {
        console.log('🚫 Emergency Font Modal Fix 비활성화');
        
        // setupEmergencyFontHandler 함수 무력화
        if (window.setupEmergencyFontHandler) {
            window.setupEmergencyFontHandler = function() {
                console.log('setupEmergencyFontHandler 비활성화됨');
            };
        }
        
        // 전역 변수 설정으로 실행 방지
        window._emergencyHandlerSetup = true;
        
        // DOM 로드 이벤트 제거
        const listeners = getEventListeners ? getEventListeners(document) : null;
        if (listeners && listeners.DOMContentLoaded) {
            listeners.DOMContentLoaded.forEach(listener => {
                if (listener.listener.toString().includes('setupEmergencyFontHandler')) {
                    document.removeEventListener('DOMContentLoaded', listener.listener);
                }
            });
        }
    }
    
    // ========== 2. 미리보기 모드 완전 통합 ==========
    function completePreviewIntegration() {
        console.log('🔍 미리보기 모드 완전 통합');
        
        // 모든 미리보기 비활성화
        if (window.PreviewControl?.disable) {
            window.PreviewControl.disable();
        }
        if (window.toggleSafePreview) {
            window.toggleSafePreview(false);
        }
        document.body.classList.remove('preview-mode', 'safe-preview-mode');
        document.body.style.transform = 'none';
        
        // 단일 미리보기 시스템으로 통합
        window.UnifiedPreviewSystem = {
            isActive: false,
            scale: 0.8,
            
            enable() {
                if (this.isActive) return;
                console.log('🔍 통합 미리보기 활성화');
                
                this.isActive = true;
                document.body.classList.add('unified-preview-mode');
                
                const container = document.querySelector('.container');
                if (container) {
                    container.style.transform = `scale(${this.scale})`;
                    container.style.transformOrigin = 'top center';
                }
                
                // 모달 보호
                document.querySelectorAll('.modal, .modal-content').forEach(modal => {
                    modal.style.zIndex = '10000';
                    modal.style.pointerEvents = 'auto';
                });
            },
            
            disable() {
                if (!this.isActive) return;
                console.log('❌ 통합 미리보기 비활성화');
                
                this.isActive = false;
                document.body.classList.remove('unified-preview-mode');
                
                const container = document.querySelector('.container');
                if (container) {
                    container.style.transform = 'none';
                }
            },
            
            toggle() {
                this.isActive ? this.disable() : this.enable();
            }
        };
        
        // 기존 시스템 리다이렉트
        if (window.PreviewControl) {
            window.PreviewControl.enable = () => window.UnifiedPreviewSystem.enable();
            window.PreviewControl.disable = () => window.UnifiedPreviewSystem.disable();
            window.PreviewControl.isEnabled = () => window.UnifiedPreviewSystem.isActive;
        }
        
        if (window.toggleSafePreview) {
            window.toggleSafePreview = (enable) => {
                enable ? window.UnifiedPreviewSystem.enable() : window.UnifiedPreviewSystem.disable();
            };
        }
    }
    
    // ========== 3. 버튼 핸들러 통합 ==========
    function unifyButtonHandlers() {
        console.log('🔨 버튼 핸들러 통합');
        
        // 모든 중복 버튼 제거
        const fontBtns = document.querySelectorAll('#fontSizeDetailBtn');
        console.log(`글자 크기 버튼 ${fontBtns.length}개 발견`);
        
        if (fontBtns.length > 1) {
            for (let i = 1; i < fontBtns.length; i++) {
                fontBtns[i].remove();
            }
        }
        
        // 메인 버튼에 단일 핸들러 설정
        const mainBtn = document.getElementById('fontSizeDetailBtn');
        if (mainBtn) {
            // 모든 기존 이벤트 제거
            const newBtn = mainBtn.cloneNode(true);
            newBtn.dataset.unifiedHandler = 'true';
            
            // 통합 핸들러
            newBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('✅ 통합 글자 크기 버튼 클릭');
                
                // 기존 모달 제거
                document.querySelectorAll('#fontSizeModal').forEach(m => m.remove());
                
                // 모달 열기
                try {
                    if (window.AdvancedControls?.openFontSizeModal) {
                        window.AdvancedControls.openFontSizeModal();
                        
                        // 미리보기 활성화
                        setTimeout(() => {
                            window.UnifiedPreviewSystem.enable();
                        }, 100);
                    } else {
                        throw new Error('AdvancedControls 없음');
                    }
                } catch (err) {
                    console.error('모달 오류:', err);
                    if (window.openEmergencyFontModal) {
                        window.openEmergencyFontModal('fallback');
                    }
                }
            };
            
            if (mainBtn.parentNode) {
                mainBtn.parentNode.replaceChild(newBtn, mainBtn);
                console.log('✅ 버튼 핸들러 통합 완료');
            }
        }
    }
    
    // ========== 4. 모달 감지 최적화 ==========
    function optimizeModalDetection() {
        console.log('⚡ 모달 감지 최적화');
        
        // 기존 MutationObserver 제거
        if (window._modalObserver) {
            window._modalObserver.disconnect();
        }
        
        // 새로운 최적화된 Observer
        window._modalObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList?.contains('modal')) {
                        // 중복 모달 체크
                        if (node.id) {
                            const existing = document.querySelectorAll(`#${node.id}`);
                            if (existing.length > 1) {
                                console.log(`중복 모달 ${node.id} 제거`);
                                node.remove();
                                return;
                            }
                        }
                        
                        // 글자/색상 모달이면 미리보기 활성화
                        if (node.id === 'fontSizeModal' || node.id === 'colorModeModal') {
                            setTimeout(() => {
                                window.UnifiedPreviewSystem.enable();
                            }, 100);
                        }
                    }
                });
            });
        });
        
        window._modalObserver.observe(document.body, {
            childList: true,
            subtree: false
        });
    }
    
    // ========== 5. 주기적 정리 개선 ==========
    function improvePeriodicCleanup() {
        console.log('🔄 주기적 정리 개선');
        
        // 기존 interval 모두 제거
        for (let i = 1; i < 99999; i++) {
            if (window['_interval_' + i]) {
                clearInterval(window['_interval_' + i]);
            }
        }
        
        // 단일 정리 interval (15초)
        window._mainCleanupInterval = setInterval(() => {
            // 중복 모달 체크
            ['fontSizeModal', 'colorModeModal', 'themeModal'].forEach(id => {
                const modals = document.querySelectorAll(`#${id}`);
                if (modals.length > 1) {
                    for (let i = 1; i < modals.length; i++) {
                        modals[i].remove();
                    }
                }
            });
            
            // 중복 버튼 체크
            const btns = document.querySelectorAll('#fontSizeDetailBtn');
            if (btns.length > 1) {
                for (let i = 1; i < btns.length; i++) {
                    btns[i].remove();
                }
            }
        }, 15000);
    }
    
    // ========== 6. 콘솔 최적화 ==========
    function optimizeConsole() {
        console.log('📝 콘솔 최적화');
        
        const originalLog = console.log;
        const messageCount = {};
        const maxCount = 3;
        
        console.log = function(...args) {
            const message = args.join(' ');
            
            // 필터할 패턴
            const filterPatterns = [
                '클릭 좌표 보정',
                '미리보기 컨트롤 설정 완료',
                'parentNode 없음',
                '중복 요소 강제 제거'
            ];
            
            for (const pattern of filterPatterns) {
                if (message.includes(pattern)) {
                    messageCount[pattern] = (messageCount[pattern] || 0) + 1;
                    if (messageCount[pattern] > maxCount) {
                        return; // 3회 초과 메시지 무시
                    }
                }
            }
            
            originalLog.apply(console, args);
        };
    }
    
    // ========== 7. 상태 모니터링 ==========
    function monitorStatus() {
        console.log('\n=== 📊 시스템 상태 ===');
        
        const status = {
            '글자 크기 버튼': document.querySelectorAll('#fontSizeDetailBtn').length,
            '색상 모드 버튼': document.querySelectorAll('#colorModeDetailBtn').length,
            'fontSizeModal': document.querySelectorAll('#fontSizeModal').length,
            '미리보기 상태': window.UnifiedPreviewSystem?.isActive || false,
            '활성 모달': document.querySelectorAll('.modal:not([style*="display: none"])').length
        };
        
        console.table(status);
        
        // 문제 체크
        const issues = [];
        if (status['글자 크기 버튼'] !== 1) {
            issues.push(`버튼 개수 이상: ${status['글자 크기 버튼']}`);
        }
        if (status['fontSizeModal'] > 1) {
            issues.push(`모달 중복: ${status['fontSizeModal']}`);
        }
        
        if (issues.length > 0) {
            console.warn('⚠️ 발견된 문제:', issues);
            console.log('자동 수정 시도...');
            unifyButtonHandlers();
        } else {
            console.log('✅ 시스템 정상');
        }
        
        console.log('===================\n');
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🎯 최종 통합 초기화');
        
        // 1. Emergency Fix 비활성화
        disableEmergencyFix();
        
        // 2. 미리보기 통합
        completePreviewIntegration();
        
        // 3. 버튼 핸들러 통합
        setTimeout(unifyButtonHandlers, 500);
        
        // 4. 모달 감지 최적화
        optimizeModalDetection();
        
        // 5. 주기적 정리 개선
        improvePeriodicCleanup();
        
        // 6. 콘솔 최적화
        optimizeConsole();
        
        // 7. 3초 후 상태 확인
        setTimeout(monitorStatus, 3000);
        
        console.log('✅ 최종 통합 완료');
    }
    
    // 즉시 실행 (다른 스크립트보다 먼저)
    disableEmergencyFix(); // 즉시 비활성화
    
    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // 전역 유틸리티
    window.ultimateFix = {
        status: monitorStatus,
        fixButtons: unifyButtonHandlers,
        preview: window.UnifiedPreviewSystem,
        reset: init
    };
    
    console.log('✅ Ultimate Fix 로드 완료');
    console.log('💡 상태: ultimateFix.status()');
    console.log('💡 리셋: ultimateFix.reset()');
    
})();