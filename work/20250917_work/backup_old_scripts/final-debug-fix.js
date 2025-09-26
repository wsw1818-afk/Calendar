/**
 * 최종 디버그 및 수정 스크립트
 * - 미리보기 모드 충돌 해결
 * - 중복 버튼 문제 해결
 * - 이벤트 핸들러 최적화
 */

(function() {
    'use strict';
    
    console.log('🔧 최종 디버그 및 수정 시작');
    
    // ========== 1. 미리보기 모드 통합 ==========
    function unifyPreviewSystems() {
        console.log('🔍 미리보기 시스템 통합');
        
        // 현재 활성화된 미리보기 비활성화
        if (window.PreviewControl?.isEnabled?.()) {
            window.PreviewControl.disable();
        }
        if (document.body.classList.contains('safe-preview-mode')) {
            if (window.toggleSafePreview) {
                window.toggleSafePreview(false);
            }
        }
        
        // PreviewControl의 enable/disable을 안전한 버전으로 대체
        if (window.PreviewControl) {
            window.PreviewControl._originalEnable = window.PreviewControl.enable;
            window.PreviewControl._originalDisable = window.PreviewControl.disable;
            
            // 안전한 미리보기로 통합
            window.PreviewControl.enable = function() {
                console.log('🔍 통합 미리보기 활성화');
                
                // 중복 방지
                if (document.body.classList.contains('safe-preview-mode')) {
                    console.log('이미 안전한 미리보기 활성화됨');
                    return;
                }
                
                // toggleSafePreview 사용
                if (window.toggleSafePreview) {
                    window.toggleSafePreview(true);
                } else {
                    // 폴백: container만 scale
                    const container = document.querySelector('.container');
                    if (container) {
                        container.style.transform = 'scale(0.8)';
                        container.style.transformOrigin = 'top center';
                    }
                }
            };
            
            window.PreviewControl.disable = function() {
                console.log('❌ 통합 미리보기 비활성화');
                
                if (window.toggleSafePreview) {
                    window.toggleSafePreview(false);
                } else {
                    const container = document.querySelector('.container');
                    if (container) {
                        container.style.transform = 'none';
                    }
                }
            };
            
            console.log('✅ 미리보기 시스템 통합 완료');
        }
    }
    
    // ========== 2. 중복 버튼 문제 해결 ==========
    function fixDuplicateButtons() {
        console.log('🔨 중복 버튼 문제 해결');
        
        // 글자 크기 버튼 정리
        const fontBtns = document.querySelectorAll('#fontSizeDetailBtn');
        console.log(`글자 크기 버튼 ${fontBtns.length}개 발견`);
        
        if (fontBtns.length > 1) {
            // 첫 번째만 남기고 나머지 제거
            for (let i = 1; i < fontBtns.length; i++) {
                console.log(`중복 버튼 ${i} 제거`);
                fontBtns[i].remove();
            }
        }
        
        // 남은 버튼에 단일 핸들러만 설정
        const finalBtn = document.getElementById('fontSizeDetailBtn');
        if (finalBtn && !finalBtn.dataset.finalHandler) {
            // 기존 이벤트 제거
            const newBtn = finalBtn.cloneNode(true);
            newBtn.dataset.finalHandler = 'true';
            
            // 단일 클릭 핸들러
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('✅ 최종 글자 크기 버튼 클릭');
                
                // 기존 모달 제거
                document.querySelectorAll('#fontSizeModal').forEach(m => m.remove());
                
                // 모달 열기
                if (window.AdvancedControls?.openFontSizeModal) {
                    try {
                        window.AdvancedControls.openFontSizeModal();
                    } catch (err) {
                        console.error('모달 오류:', err);
                        if (window.openEmergencyFontModal) {
                            window.openEmergencyFontModal('fallback');
                        }
                    }
                } else if (window.openEmergencyFontModal) {
                    window.openEmergencyFontModal('no AdvancedControls');
                }
            }, { once: false });
            
            if (finalBtn.parentNode) {
                finalBtn.parentNode.replaceChild(newBtn, finalBtn);
                console.log('✅ 글자 크기 버튼 최종 핸들러 설정');
            }
        }
        
        // 색상 모드 버튼도 동일하게 처리
        const colorBtns = document.querySelectorAll('#colorModeDetailBtn');
        if (colorBtns.length > 1) {
            for (let i = 1; i < colorBtns.length; i++) {
                colorBtns[i].remove();
            }
        }
    }
    
    // ========== 3. emergency-font-modal-fix.js 최적화 ==========
    function optimizeEmergencyFix() {
        console.log('⚡ Emergency Fix 최적화');
        
        // setupEmergencyFontHandler가 여러 번 실행되는 것 방지
        if (window._emergencyHandlerSetup) {
            console.log('Emergency handler 이미 설정됨, 스킵');
            return;
        }
        window._emergencyHandlerSetup = true;
        
        // 불필요한 버튼 검색 방지
        const mainBtn = document.getElementById('fontSizeDetailBtn');
        if (mainBtn && mainBtn.dataset.finalHandler) {
            console.log('최종 핸들러 이미 설정됨');
            return;
        }
    }
    
    // ========== 4. 주기적 정리 최적화 ==========
    function optimizePeriodicCleanup() {
        console.log('⏰ 주기적 정리 최적화');
        
        // 기존 interval 제거
        if (window._cleanupInterval) {
            clearInterval(window._cleanupInterval);
        }
        
        // 10초마다 한 번만 실행 (3초는 너무 자주)
        window._cleanupInterval = setInterval(() => {
            // 중복 모달만 체크
            const modals = document.querySelectorAll('#fontSizeModal');
            if (modals.length > 1) {
                console.log('중복 모달 정리');
                for (let i = 1; i < modals.length; i++) {
                    modals[i].remove();
                }
            }
        }, 10000);
    }
    
    // ========== 5. 모달 자동 감지 수정 ==========
    function fixModalAutoDetection() {
        console.log('🔄 모달 자동 감지 수정');
        
        // preview-control.js의 자동 감지가 너무 자주 실행되는 문제 해결
        if (window.PreviewControl?.setupModalControls) {
            const original = window.PreviewControl.setupModalControls;
            let lastCall = 0;
            
            window.PreviewControl.setupModalControls = function() {
                const now = Date.now();
                if (now - lastCall < 1000) {
                    // 1초 이내 중복 호출 방지
                    return;
                }
                lastCall = now;
                original.call(this);
            };
        }
    }
    
    // ========== 6. 콘솔 정리 ==========
    function cleanupConsole() {
        console.log('🧹 콘솔 정리');
        
        // 반복되는 로그 필터링
        const originalLog = console.log;
        const logCounts = {};
        
        console.log = function(...args) {
            const message = args.join(' ');
            
            // 반복되는 메시지 필터
            const filterPatterns = [
                '클릭 좌표 보정',
                '중복 요소 강제 제거',
                '미리보기 컨트롤 설정 완료'
            ];
            
            for (const pattern of filterPatterns) {
                if (message.includes(pattern)) {
                    if (!logCounts[pattern]) {
                        logCounts[pattern] = 0;
                    }
                    logCounts[pattern]++;
                    
                    // 5번 이상 반복되면 무시
                    if (logCounts[pattern] > 5) {
                        return;
                    }
                }
            }
            
            originalLog.apply(console, args);
        };
    }
    
    // ========== 7. 상태 확인 ==========
    function checkSystemStatus() {
        console.log('\n=== 🏁 시스템 상태 확인 ===');
        
        const status = {
            '글자 크기 버튼': document.querySelectorAll('#fontSizeDetailBtn').length,
            '색상 모드 버튼': document.querySelectorAll('#colorModeDetailBtn').length,
            '활성 모달': document.querySelectorAll('.modal:not([style*="display: none"])').length,
            '미리보기 상태': {
                'PreviewControl': window.PreviewControl?.isEnabled?.() || false,
                'SafePreview': document.body.classList.contains('safe-preview-mode')
            },
            '중복 fontSizeModal': document.querySelectorAll('#fontSizeModal').length
        };
        
        console.table(status);
        
        // 문제 진단
        const issues = [];
        if (status['글자 크기 버튼'] > 1) {
            issues.push('⚠️ 글자 크기 버튼 중복');
        }
        if (status['중복 fontSizeModal'] > 1) {
            issues.push('⚠️ fontSizeModal 중복');
        }
        if (status['미리보기 상태'].PreviewControl && status['미리보기 상태'].SafePreview) {
            issues.push('⚠️ 미리보기 모드 충돌');
        }
        
        if (issues.length > 0) {
            console.warn('발견된 문제:', issues);
        } else {
            console.log('✅ 시스템 정상');
        }
        
        console.log('========================\n');
        
        return status;
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 최종 디버그 초기화');
        
        // 1. 미리보기 통합
        unifyPreviewSystems();
        
        // 2. 중복 버튼 수정
        fixDuplicateButtons();
        
        // 3. Emergency Fix 최적화
        optimizeEmergencyFix();
        
        // 4. 주기적 정리 최적화
        optimizePeriodicCleanup();
        
        // 5. 모달 자동 감지 수정
        fixModalAutoDetection();
        
        // 6. 콘솔 정리
        cleanupConsole();
        
        // 7. 2초 후 상태 확인
        setTimeout(checkSystemStatus, 2000);
        
        console.log('✅ 최종 디버그 완료');
    }
    
    // DOM 로드 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // 다른 스크립트 로드 대기
        setTimeout(init, 1500);
    }
    
    // 전역 유틸리티
    window.finalDebug = {
        status: checkSystemStatus,
        fixButtons: fixDuplicateButtons,
        unifyPreview: unifyPreviewSystems,
        reset: function() {
            console.log('🔄 시스템 리셋');
            init();
        }
    };
    
    console.log('✅ 최종 디버그 스크립트 로드');
    console.log('💡 상태: finalDebug.status()');
    console.log('💡 리셋: finalDebug.reset()');
    
})();