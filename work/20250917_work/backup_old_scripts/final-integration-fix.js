/**
 * 최종 통합 수정 스크립트
 * - 중복 모달 ID 문제 해결
 * - 버튼 이벤트 핸들러 중복 방지
 * - 미리보기 모드 전환 최적화
 */

(function() {
    'use strict';
    
    console.log('🔧 최종 통합 수정 시작');
    
    // ========== 1. 중복 요소 정리 ==========
    function cleanupDuplicates() {
        console.log('🧹 중복 요소 정리');
        
        // 중복 모달 제거
        const modalIds = ['fontSizeModal', 'colorModeModal', 'themeModal', 'layoutModal'];
        modalIds.forEach(id => {
            const modals = document.querySelectorAll(`#${id}`);
            if (modals.length > 1) {
                console.log(`중복 ${id} 발견: ${modals.length}개`);
                // 첫 번째만 남기고 나머지 제거
                for (let i = 1; i < modals.length; i++) {
                    modals[i].remove();
                    console.log(`${id} 중복 제거됨`);
                }
            }
        });
        
        // 중복 버튼 이벤트 제거
        const buttons = document.querySelectorAll('#fontSizeDetailBtn');
        if (buttons.length > 1) {
            console.log(`중복 글자 크기 버튼: ${buttons.length}개`);
            // 첫 번째 버튼만 활성화
            for (let i = 1; i < buttons.length; i++) {
                buttons[i].style.display = 'none';
                console.log('중복 버튼 숨김');
            }
        }
    }
    
    // ========== 2. 안전한 이벤트 핸들러 등록 ==========
    function setupSafeEventHandlers() {
        console.log('🔒 안전한 이벤트 핸들러 설정');
        
        // 글자 크기 버튼
        const fontBtn = document.getElementById('fontSizeDetailBtn');
        if (fontBtn && !fontBtn.dataset.safeHandler) {
            // 기존 이벤트 제거
            const newBtn = fontBtn.cloneNode(true);
            fontBtn.parentNode?.replaceChild(newBtn, fontBtn);
            
            // 새 이벤트 등록
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('✅ 안전한 글자 크기 버튼 클릭');
                
                // 기존 모달 제거
                document.querySelectorAll('#fontSizeModal').forEach(m => m.remove());
                
                // 함수 호출
                if (window.AdvancedControls?.openFontSizeModal) {
                    try {
                        window.AdvancedControls.openFontSizeModal();
                    } catch (err) {
                        console.error('모달 열기 실패:', err);
                        if (window.openEmergencyFontModal) {
                            window.openEmergencyFontModal('안전 모드');
                        }
                    }
                } else if (window.openEmergencyFontModal) {
                    window.openEmergencyFontModal('안전 모드');
                }
            });
            
            newBtn.dataset.safeHandler = 'true';
            console.log('✅ 글자 크기 버튼 안전 핸들러 등록');
        }
        
        // 색상 모드 버튼
        const colorBtn = document.getElementById('colorModeDetailBtn');
        if (colorBtn && !colorBtn.dataset.safeHandler) {
            const newColorBtn = colorBtn.cloneNode(true);
            colorBtn.parentNode?.replaceChild(newColorBtn, colorBtn);
            
            newColorBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('✅ 안전한 색상 모드 버튼 클릭');
                
                // 기존 모달 제거
                document.querySelectorAll('#colorModeModal').forEach(m => m.remove());
                
                if (window.AdvancedControls?.openColorModeModal) {
                    window.AdvancedControls.openColorModeModal();
                }
            });
            
            newColorBtn.dataset.safeHandler = 'true';
            console.log('✅ 색상 모드 버튼 안전 핸들러 등록');
        }
    }
    
    // ========== 3. 미리보기 모드 통합 ==========
    function unifyPreviewMode() {
        console.log('🔍 미리보기 모드 통합');
        
        // 기존 미리보기 함수들 통합
        if (!window.UnifiedPreview) {
            window.UnifiedPreview = {
                isActive: false,
                scale: 0.8,
                
                enable: function() {
                    if (this.isActive) return;
                    
                    console.log('🔍 통합 미리보기 활성화');
                    this.isActive = true;
                    
                    // 안전한 미리보기 사용
                    if (window.toggleSafePreview) {
                        window.toggleSafePreview(true);
                    } else {
                        // 폴백: container만 scale
                        const container = document.querySelector('.container');
                        if (container) {
                            container.style.transform = `scale(${this.scale})`;
                            container.style.transformOrigin = 'top center';
                        }
                    }
                    
                    // 모든 모달 보호
                    this.protectModals();
                },
                
                disable: function() {
                    if (!this.isActive) return;
                    
                    console.log('❌ 통합 미리보기 비활성화');
                    this.isActive = false;
                    
                    if (window.toggleSafePreview) {
                        window.toggleSafePreview(false);
                    } else {
                        const container = document.querySelector('.container');
                        if (container) {
                            container.style.transform = 'none';
                        }
                    }
                    
                    this.unprotectModals();
                },
                
                toggle: function() {
                    if (this.isActive) {
                        this.disable();
                    } else {
                        this.enable();
                    }
                },
                
                protectModals: function() {
                    const modals = document.querySelectorAll('.modal, .modal-content');
                    modals.forEach(modal => {
                        modal.style.zIndex = '10000';
                        modal.style.pointerEvents = 'auto';
                    });
                },
                
                unprotectModals: function() {
                    const modals = document.querySelectorAll('.modal, .modal-content');
                    modals.forEach(modal => {
                        modal.style.zIndex = '';
                        modal.style.pointerEvents = '';
                    });
                }
            };
        }
        
        // 기존 PreviewControl과 통합
        if (window.PreviewControl) {
            const originalEnable = window.PreviewControl.enable;
            const originalDisable = window.PreviewControl.disable;
            
            window.PreviewControl.enable = function() {
                window.UnifiedPreview.enable();
            };
            
            window.PreviewControl.disable = function() {
                window.UnifiedPreview.disable();
            };
        }
    }
    
    // ========== 4. 모달 관찰자 설정 ==========
    function setupModalObserver() {
        console.log('👁️ 모달 관찰자 설정');
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList?.contains('modal')) {
                            console.log('새 모달 감지:', node.id);
                            
                            // 중복 체크
                            const existingModal = document.querySelector(`#${node.id}:not([data-checking])`);
                            if (existingModal && existingModal !== node) {
                                node.setAttribute('data-checking', 'true');
                                console.log(`중복 모달 ${node.id} 제거`);
                                node.remove();
                                return;
                            }
                            
                            // 미리보기 자동 활성화
                            if (node.id === 'fontSizeModal' || node.id === 'colorModeModal') {
                                setTimeout(() => {
                                    window.UnifiedPreview?.enable();
                                }, 100);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ 모달 관찰자 활성화');
    }
    
    // ========== 5. 에러 핸들링 강화 ==========
    function enhanceErrorHandling() {
        console.log('🛡️ 에러 핸들링 강화');
        
        // 전역 에러 캐처
        window.addEventListener('error', function(e) {
            if (e.message?.includes('Cannot read properties of null')) {
                console.warn('Null 참조 에러 감지, 자동 복구 시도');
                
                // DOM 정리 및 재초기화
                setTimeout(() => {
                    cleanupDuplicates();
                    setupSafeEventHandlers();
                }, 100);
                
                e.preventDefault();
                return true;
            }
        });
        
        // Promise 에러 캐처
        window.addEventListener('unhandledrejection', function(e) {
            if (e.reason?.toString().includes('modal')) {
                console.warn('모달 관련 Promise 에러, 자동 복구');
                e.preventDefault();
            }
        });
    }
    
    // ========== 6. 초기화 ==========
    function init() {
        console.log('🚀 최종 통합 수정 초기화');
        
        // 1. 정리
        cleanupDuplicates();
        
        // 2. 이벤트 설정
        setupSafeEventHandlers();
        
        // 3. 미리보기 통합
        unifyPreviewMode();
        
        // 4. 관찰자 설정
        setupModalObserver();
        
        // 5. 에러 핸들링
        enhanceErrorHandling();
        
        // 6. 주기적 정리 (5초마다)
        setInterval(() => {
            cleanupDuplicates();
        }, 5000);
        
        console.log('✅ 최종 통합 수정 완료');
    }
    
    // DOM 로드 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // 약간의 지연 후 실행 (다른 스크립트 로드 대기)
        setTimeout(init, 1500);
    }
    
    // 전역 유틸리티 함수
    window.finalIntegrationUtils = {
        cleanup: cleanupDuplicates,
        setupHandlers: setupSafeEventHandlers,
        unifyPreview: unifyPreviewMode,
        checkStatus: function() {
            console.log('=== 시스템 상태 점검 ===');
            console.log('중복 모달:', document.querySelectorAll('#fontSizeModal').length);
            console.log('중복 버튼:', document.querySelectorAll('#fontSizeDetailBtn').length);
            console.log('미리보기 상태:', window.UnifiedPreview?.isActive);
            console.log('======================');
        }
    };
    
    console.log('✅ 최종 통합 수정 스크립트 로드 완료');
    console.log('💡 상태 확인: finalIntegrationUtils.checkStatus()');
    
})();