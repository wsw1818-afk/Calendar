/**
 * 안정적인 미리보기 수정
 * - 미리보기 기능 복구
 * - 중복 실행 방지
 * - 메뉴 클릭 정상 작동
 */

(function() {
    'use strict';
    
    console.log('🔧 안정적인 미리보기 수정 시작');
    
    // ========== 1. 전역 상태 관리 ==========
    window.StablePreview = {
        isActive: false,
        scale: 0.8,
        isTransitioning: false
    };
    
    // ========== 2. 미리보기 시스템 통합 ==========
    function setupUnifiedPreview() {
        console.log('🔍 통합 미리보기 설정');
        
        // 안전한 미리보기 활성화
        window.enablePreview = function() {
            // 중복 실행 방지
            if (window.StablePreview.isActive || window.StablePreview.isTransitioning) {
                console.log('미리보기 이미 활성화 중 또는 전환 중');
                return;
            }
            
            window.StablePreview.isTransitioning = true;
            console.log('🔍 미리보기 활성화');
            
            // body 스케일 대신 container만 스케일
            const container = document.querySelector('.container');
            if (container) {
                container.style.transition = 'transform 0.3s ease';
                container.style.transform = `scale(${window.StablePreview.scale})`;
                container.style.transformOrigin = 'top center';
                container.style.margin = '0 auto';
            }
            
            // 모달 보호
            document.querySelectorAll('.modal, .modal-content').forEach(modal => {
                modal.style.zIndex = '10000';
                modal.style.pointerEvents = 'auto';
            });
            
            // 미리보기 표시
            showPreviewIndicator();
            
            window.StablePreview.isActive = true;
            
            setTimeout(() => {
                window.StablePreview.isTransitioning = false;
            }, 300);
        };
        
        // 안전한 미리보기 비활성화
        window.disablePreview = function() {
            // 중복 실행 방지
            if (!window.StablePreview.isActive || window.StablePreview.isTransitioning) {
                console.log('미리보기 이미 비활성화 중 또는 전환 중');
                return;
            }
            
            window.StablePreview.isTransitioning = true;
            console.log('❌ 미리보기 비활성화');
            
            const container = document.querySelector('.container');
            if (container) {
                container.style.transform = 'none';
            }
            
            hidePreviewIndicator();
            
            window.StablePreview.isActive = false;
            
            setTimeout(() => {
                window.StablePreview.isTransitioning = false;
            }, 300);
        };
        
        // 기존 시스템과 연결
        if (window.PreviewControl) {
            window.PreviewControl.enable = window.enablePreview;
            window.PreviewControl.disable = window.disablePreview;
            window.PreviewControl.isEnabled = () => window.StablePreview.isActive;
        }
        
        if (window.toggleSafePreview) {
            window.toggleSafePreview = function(enable) {
                if (enable) {
                    window.enablePreview();
                } else {
                    window.disablePreview();
                }
            };
        }
    }
    
    // ========== 3. 미리보기 표시기 ==========
    function showPreviewIndicator() {
        hidePreviewIndicator();
        
        const indicator = document.createElement('div');
        indicator.id = 'previewIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            z-index: 100000;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            pointer-events: none;
            animation: slideIn 0.3s ease;
        `;
        indicator.textContent = `🔍 미리보기 모드 (${window.StablePreview.scale * 100}%)`;
        
        document.body.appendChild(indicator);
    }
    
    function hidePreviewIndicator() {
        const indicator = document.getElementById('previewIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // ========== 4. 모달에 미리보기 컨트롤 추가 ==========
    function addPreviewControls() {
        console.log('🎛️ 미리보기 컨트롤 추가');
        
        // 글자 크기 모달에 미리보기 슬라이더 추가
        const addControlToModal = (modalId) => {
            const modal = document.getElementById(modalId);
            if (!modal || modal.querySelector('.preview-control-added')) return;
            
            const modalContent = modal.querySelector('.modal-content') || modal.querySelector('.modal-body');
            if (!modalContent) return;
            
            const previewControl = document.createElement('div');
            previewControl.className = 'preview-control-added';
            previewControl.style.cssText = `
                margin: 20px 0;
                padding: 15px;
                background: #f0f4f8;
                border-radius: 8px;
            `;
            
            previewControl.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>🔍 미리보기 크기</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="previewScale" min="30" max="100" value="${window.StablePreview.scale * 100}" 
                           style="flex: 1;">
                    <span id="previewValue">${window.StablePreview.scale * 100}%</span>
                    <button onclick="window.StablePreview.isActive ? window.disablePreview() : window.enablePreview()"
                            style="padding: 5px 15px; border-radius: 5px; background: #667eea; color: white; border: none; cursor: pointer;">
                        ${window.StablePreview.isActive ? '끄기' : '켜기'}
                    </button>
                </div>
            `;
            
            modalContent.insertBefore(previewControl, modalContent.firstChild);
            
            // 슬라이더 이벤트
            const slider = document.getElementById('previewScale');
            const value = document.getElementById('previewValue');
            if (slider) {
                slider.oninput = function() {
                    window.StablePreview.scale = this.value / 100;
                    value.textContent = this.value + '%';
                    if (window.StablePreview.isActive) {
                        const container = document.querySelector('.container');
                        if (container) {
                            container.style.transform = `scale(${window.StablePreview.scale})`;
                        }
                        hidePreviewIndicator();
                        showPreviewIndicator();
                    }
                };
            }
        };
        
        // 모달 감지 및 컨트롤 추가
        const checkModals = () => {
            if (document.getElementById('fontSizeModal')) {
                addControlToModal('fontSizeModal');
                // 자동으로 미리보기 활성화
                if (!window.StablePreview.isActive) {
                    window.enablePreview();
                }
            }
            if (document.getElementById('colorModeModal')) {
                addControlToModal('colorModeModal');
                // 자동으로 미리보기 활성화
                if (!window.StablePreview.isActive) {
                    window.enablePreview();
                }
            }
        };
        
        // MutationObserver로 모달 감지
        const observer = new MutationObserver(checkModals);
        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
        
        // 초기 체크
        checkModals();
    }
    
    // ========== 5. 모달 닫힐 때 미리보기 비활성화 ==========
    function setupModalCloseHandler() {
        console.log('📝 모달 닫기 핸들러 설정');
        
        // ESC 키로 모달 닫을 때
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const hasModal = document.querySelector('#fontSizeModal, #colorModeModal');
                if (!hasModal && window.StablePreview.isActive) {
                    window.disablePreview();
                }
            }
        });
        
        // 모달 외부 클릭으로 닫을 때
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                setTimeout(() => {
                    const hasModal = document.querySelector('#fontSizeModal, #colorModeModal');
                    if (!hasModal && window.StablePreview.isActive) {
                        window.disablePreview();
                    }
                }, 100);
            }
        });
    }
    
    // ========== 6. 중복 버튼 정리 ==========
    function cleanupDuplicateButtons() {
        console.log('🧹 중복 버튼 정리');
        
        ['fontSizeDetailBtn', 'colorModeDetailBtn'].forEach(id => {
            const buttons = document.querySelectorAll(`#${id}`);
            if (buttons.length > 1) {
                console.log(`${id}: ${buttons.length}개 → 1개`);
                for (let i = 1; i < buttons.length; i++) {
                    buttons[i].remove();
                }
            }
        });
    }
    
    // ========== 7. 상태 모니터링 ==========
    function monitorStatus() {
        console.log('\n=== 📊 시스템 상태 ===');
        
        const status = {
            '미리보기 상태': window.StablePreview.isActive ? '활성' : '비활성',
            '미리보기 스케일': window.StablePreview.scale * 100 + '%',
            '전환 중': window.StablePreview.isTransitioning ? '예' : '아니오',
            'fontSizeModal': document.getElementById('fontSizeModal') ? '열림' : '닫힘',
            'colorModeModal': document.getElementById('colorModeModal') ? '열림' : '닫힘',
            '중복 버튼': {
                '글자 크기': document.querySelectorAll('#fontSizeDetailBtn').length,
                '색상 모드': document.querySelectorAll('#colorModeDetailBtn').length
            }
        };
        
        console.table(status);
        console.log('==================\n');
        
        return status;
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 안정적인 미리보기 초기화');
        
        // 1. 통합 미리보기 설정
        setupUnifiedPreview();
        
        // 2. 미리보기 컨트롤 추가
        addPreviewControls();
        
        // 3. 모달 닫기 핸들러
        setupModalCloseHandler();
        
        // 4. 중복 버튼 정리
        setTimeout(cleanupDuplicateButtons, 1000);
        
        // 5. 주기적 정리 (30초마다)
        setInterval(cleanupDuplicateButtons, 30000);
        
        console.log('✅ 안정적인 미리보기 초기화 완료');
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }
    
    // 전역 유틸리티
    window.stablePreview = {
        enable: window.enablePreview,
        disable: window.disablePreview,
        toggle: () => window.StablePreview.isActive ? window.disablePreview() : window.enablePreview(),
        status: monitorStatus,
        scale: (value) => {
            if (value >= 0.3 && value <= 1) {
                window.StablePreview.scale = value;
                if (window.StablePreview.isActive) {
                    window.disablePreview();
                    window.enablePreview();
                }
            }
        }
    };
    
    console.log('✅ 안정적인 미리보기 로드 완료');
    console.log('💡 미리보기 토글: stablePreview.toggle()');
    console.log('💡 상태 확인: stablePreview.status()');
    
})();