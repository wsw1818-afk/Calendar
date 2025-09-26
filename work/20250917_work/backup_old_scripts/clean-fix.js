/**
 * 깨끗한 수정 스크립트
 * - 모든 충돌 제거
 * - 단순하고 명확한 해결책
 */

(function() {
    'use strict';
    
    console.log('🧹 깨끗한 수정 시작 (CLEAN FIX)');
    
    // ========== 1. 미리보기 시스템 완전 비활성화 ==========
    function disableAllPreviews() {
        console.log('❌ 모든 미리보기 시스템 비활성화');
        
        // preview-control.js 비활성화
        if (window.PreviewControl) {
            window.PreviewControl.enable = function() {
                console.log('PreviewControl.enable 비활성화됨');
            };
            window.PreviewControl.disable = function() {
                console.log('PreviewControl.disable 비활성화됨');
            };
            window.PreviewControl.isEnabled = function() {
                return false;
            };
        }
        
        // preview-mode-fix.js 비활성화
        if (window.toggleSafePreview) {
            window.toggleSafePreview = function() {
                console.log('toggleSafePreview 비활성화됨');
            };
        }
        
        // 모든 미리보기 클래스 제거
        document.body.classList.remove('preview-mode', 'safe-preview-mode', 'unified-preview-mode');
        document.body.style.transform = 'none';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        
        // container 스케일 제거
        const container = document.querySelector('.container');
        if (container) {
            container.style.transform = 'none';
            container.style.transformOrigin = '';
        }
        
        console.log('✅ 미리보기 완전 비활성화');
    }
    
    // ========== 2. 클릭 이벤트 보정 제거 ==========
    function removeClickCorrection() {
        console.log('🖱️ 클릭 좌표 보정 제거');
        
        // 기존 이벤트 리스너 제거 시도
        const oldListeners = document._clickListeners || [];
        oldListeners.forEach(listener => {
            document.removeEventListener('click', listener, true);
        });
        
        // 클릭 좌표 보정 함수가 있다면 무력화
        if (window.fixClickEvents) {
            window.fixClickEvents = function() {};
        }
    }
    
    // ========== 3. 글자 크기 버튼 단순화 ==========
    function simplifyFontButton() {
        console.log('📝 글자 크기 버튼 단순화');
        
        // 모든 중복 버튼 제거
        const allButtons = document.querySelectorAll('#fontSizeDetailBtn');
        console.log(`발견된 버튼: ${allButtons.length}개`);
        
        // 첫 번째만 남기고 제거
        for (let i = 1; i < allButtons.length; i++) {
            allButtons[i].remove();
        }
        
        // 남은 버튼에 단순한 핸들러
        const btn = document.getElementById('fontSizeDetailBtn');
        if (btn) {
            // 모든 기존 이벤트 제거
            const newBtn = btn.cloneNode(true);
            newBtn.onclick = null;
            newBtn.removeAttribute('onclick');
            
            // 단순한 클릭 핸들러
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📝 글자 크기 버튼 클릭');
                
                // 기존 모달 제거
                document.querySelectorAll('#fontSizeModal').forEach(m => m.remove());
                
                // 모달 열기
                if (window.AdvancedControls && window.AdvancedControls.openFontSizeModal) {
                    try {
                        window.AdvancedControls.openFontSizeModal();
                    } catch (err) {
                        console.error('모달 오류:', err);
                        createSimpleFontModal();
                    }
                } else {
                    createSimpleFontModal();
                }
            });
            
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
                console.log('✅ 글자 크기 버튼 단순화 완료');
            }
        }
    }
    
    // ========== 4. 간단한 폰트 모달 (폴백) ==========
    function createSimpleFontModal() {
        console.log('📝 간단한 폰트 모달 생성');
        
        // 기존 모달 제거
        document.querySelectorAll('#fontSizeModal').forEach(m => m.remove());
        
        const modal = document.createElement('div');
        modal.id = 'fontSizeModal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
        `;
        
        content.innerHTML = `
            <h2>📝 글자 크기 설정</h2>
            <div style="margin: 20px 0;">
                <label>전체 글자 크기:</label>
                <input type="range" id="simpleFontSize" min="10" max="30" value="14" style="width: 100%;">
                <span id="fontSizeValue">14px</span>
            </div>
            <div style="text-align: right;">
                <button onclick="document.getElementById('fontSizeModal').remove()" style="margin-right: 10px;">취소</button>
                <button onclick="
                    const size = document.getElementById('simpleFontSize').value;
                    document.body.style.fontSize = size + 'px';
                    localStorage.setItem('fontSize', size);
                    document.getElementById('fontSizeModal').remove();
                ">적용</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // 슬라이더 이벤트
        const slider = document.getElementById('simpleFontSize');
        const valueSpan = document.getElementById('fontSizeValue');
        slider.oninput = function() {
            valueSpan.textContent = this.value + 'px';
        };
    }
    
    // ========== 5. 색상 모드 버튼 단순화 ==========
    function simplifyColorButton() {
        console.log('🎨 색상 모드 버튼 단순화');
        
        const btn = document.getElementById('colorModeDetailBtn');
        if (btn) {
            const newBtn = btn.cloneNode(true);
            newBtn.onclick = null;
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🎨 색상 모드 버튼 클릭');
                
                // 기존 모달 제거
                document.querySelectorAll('#colorModeModal').forEach(m => m.remove());
                
                // 모달 열기
                if (window.AdvancedControls && window.AdvancedControls.openColorModeModal) {
                    try {
                        window.AdvancedControls.openColorModeModal();
                    } catch (err) {
                        console.error('색상 모달 오류:', err);
                    }
                }
            });
            
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
                console.log('✅ 색상 모드 버튼 단순화 완료');
            }
        }
    }
    
    // ========== 6. 모달 자동 감지 비활성화 ==========  
    function disableModalAutoDetection() {
        console.log('🚫 모달 자동 감지 비활성화');
        
        // PreviewControl의 자동 감지 비활성화
        if (window.PreviewControl && window.PreviewControl.setupModalObserver) {
            window.PreviewControl.setupModalObserver = function() {
                console.log('setupModalObserver 비활성화됨');
            };
        }
        
        // MutationObserver 비활성화
        if (window._modalObserver) {
            window._modalObserver.disconnect();
            window._modalObserver = null;
        }
    }
    
    // ========== 7. 주기적 정리 단순화 ==========
    function setupSimpleCleanup() {
        console.log('🔄 주기적 정리 설정');
        
        // 기존 interval 모두 제거
        for (let i = 1; i < 9999; i++) {
            clearInterval(i);
        }
        
        // 30초마다 중복 제거
        setInterval(() => {
            // 중복 모달 제거
            ['fontSizeModal', 'colorModeModal'].forEach(id => {
                const modals = document.querySelectorAll(`#${id}`);
                if (modals.length > 1) {
                    for (let i = 1; i < modals.length; i++) {
                        modals[i].remove();
                    }
                }
            });
        }, 30000);
    }
    
    // ========== 8. 상태 확인 ==========
    function checkStatus() {
        console.log('\n=== 📊 시스템 상태 ===');
        
        const status = {
            '글자 크기 버튼': document.querySelectorAll('#fontSizeDetailBtn').length,
            '색상 모드 버튼': document.querySelectorAll('#colorModeDetailBtn').length,
            'fontSizeModal': document.querySelectorAll('#fontSizeModal').length,
            'colorModeModal': document.querySelectorAll('#colorModeModal').length,
            '미리보기 클래스': {
                'preview-mode': document.body.classList.contains('preview-mode'),
                'safe-preview-mode': document.body.classList.contains('safe-preview-mode')
            },
            'body transform': document.body.style.transform || 'none',
            'container transform': document.querySelector('.container')?.style.transform || 'none'
        };
        
        console.table(status);
        
        // 문제 체크
        if (status['글자 크기 버튼'] > 1) {
            console.warn('⚠️ 글자 크기 버튼 중복');
        }
        if (status['미리보기 클래스']['preview-mode'] || status['미리보기 클래스']['safe-preview-mode']) {
            console.warn('⚠️ 미리보기 모드 활성화됨');
        }
        if (status['body transform'] !== 'none' && status['body transform'] !== '') {
            console.warn('⚠️ body transform 적용됨');
        }
        
        console.log('==================\n');
        return status;
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🎯 깨끗한 수정 초기화');
        
        // 1. 미리보기 완전 비활성화
        disableAllPreviews();
        
        // 2. 클릭 보정 제거
        removeClickCorrection();
        
        // 3. 모달 자동 감지 비활성화
        disableModalAutoDetection();
        
        // 4. 버튼 단순화 (지연 실행)
        setTimeout(() => {
            simplifyFontButton();
            simplifyColorButton();
        }, 1000);
        
        // 5. 주기적 정리
        setupSimpleCleanup();
        
        // 6. 3초 후 상태 확인
        setTimeout(checkStatus, 3000);
        
        console.log('✅ 깨끗한 수정 완료');
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }
    
    // 전역 유틸리티
    window.cleanFix = {
        status: checkStatus,
        disablePreview: disableAllPreviews,
        fixButtons: () => {
            simplifyFontButton();
            simplifyColorButton();
        },
        reset: init
    };
    
    console.log('✅ Clean Fix 로드 완료');
    console.log('💡 상태: cleanFix.status()');
    console.log('💡 리셋: cleanFix.reset()');
    
})();