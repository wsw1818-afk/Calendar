/**
 * 충돌 코드 정리 스크립트
 * - 중복된 디버그/수정 스크립트 비활성화
 * - 필수 기능만 유지
 */

(function() {
    'use strict';
    
    console.log('🧹 충돌 코드 정리 시작');
    
    // ========== 비활성화할 스크립트 목록 ==========
    const scriptsToDisable = [
        'debug-font-modal.js',           // 디버그용 - 중복
        'enhanced-debug-font-modal.js',   // 디버그용 - 중복
        'fix-duplicate-modal.js',         // 임시 수정 - emergency-font-modal-fix.js와 중복
        'final-integration-fix.js'        // 테스트용 - 기존 코드와 충돌
    ];
    
    // ========== 1. 중복 스크립트 제거 ==========
    function removeConflictingScripts() {
        console.log('📜 중복 스크립트 제거');
        
        // script 태그 찾아서 비활성화
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            const src = script.src;
            scriptsToDisable.forEach(fileName => {
                if (src && src.includes(fileName)) {
                    console.log(`❌ 비활성화: ${fileName}`);
                    script.remove();
                }
            });
        });
    }
    
    // ========== 2. 중복 이벤트 핸들러 정리 ==========
    function cleanupDuplicateHandlers() {
        console.log('🔧 중복 이벤트 핸들러 정리');
        
        // 글자 크기 버튼 - 첫 번째만 남기고 나머지 제거
        const fontBtns = document.querySelectorAll('#fontSizeDetailBtn');
        if (fontBtns.length > 1) {
            console.log(`글자 크기 버튼 ${fontBtns.length}개 발견`);
            for (let i = 1; i < fontBtns.length; i++) {
                fontBtns[i].remove();
            }
        }
        
        // 색상 모드 버튼
        const colorBtns = document.querySelectorAll('#colorModeDetailBtn');
        if (colorBtns.length > 1) {
            console.log(`색상 모드 버튼 ${colorBtns.length}개 발견`);
            for (let i = 1; i < colorBtns.length; i++) {
                colorBtns[i].remove();
            }
        }
    }
    
    // ========== 3. 중복 모달 제거 ==========
    function removeDuplicateModals() {
        console.log('🗑️ 중복 모달 제거');
        
        const modalIds = [
            'fontSizeModal',
            'colorModeModal',
            'themeModal',
            'layoutModal',
            'excelExportModal',
            'stickerModal'
        ];
        
        modalIds.forEach(id => {
            const modals = document.querySelectorAll(`#${id}`);
            if (modals.length > 1) {
                console.log(`${id}: ${modals.length}개 → 1개`);
                for (let i = 1; i < modals.length; i++) {
                    modals[i].remove();
                }
            }
        });
    }
    
    // ========== 4. 중복 함수 정리 ==========
    function cleanupDuplicateFunctions() {
        console.log('🔨 중복 함수 정리');
        
        // 디버그 함수들 제거
        delete window.debugFontModal;
        delete window.enhancedDebugFontModal;
        delete window.fixModalIssues;
        delete window.finalIntegrationUtils;
        
        // 중복 미리보기 함수 통합
        if (window.PreviewControl && window.toggleSafePreview) {
            // toggleSafePreview를 메인으로 사용
            window.PreviewControl.enable = function() {
                window.toggleSafePreview(true);
            };
            window.PreviewControl.disable = function() {
                window.toggleSafePreview(false);
            };
            console.log('✅ 미리보기 함수 통합');
        }
        
        // UnifiedPreview 제거 (중복)
        delete window.UnifiedPreview;
    }
    
    // ========== 5. 콘솔 정리 ==========
    function cleanupConsole() {
        // console.error 원본 복원
        if (console._originalError) {
            console.error = console._originalError;
            delete console._originalError;
        }
        
        console.log('🧹 콘솔 복원 완료');
    }
    
    // ========== 6. 필수 기능만 유지 ==========
    function keepEssentialOnly() {
        console.log('✅ 필수 기능만 유지');
        
        // 필수 스크립트 목록
        const essentialScripts = [
            'calendar-complete.js',          // 메인 달력
            'theme-layout-menu.js',          // 테마/레이아웃
            'advanced-controls-modal.js',    // 고급 컨트롤
            'unified-calendar-system.js',    // 통합 시스템
            'preview-control.js',            // 미리보기 제어
            'preview-mode-fix.js',           // 미리보기 수정
            'emergency-font-modal-fix.js',   // 긴급 폰트 모달
            'global-esc-handler.js',         // ESC 키 핸들러
            'modal-drag-system.js'           // 모달 드래그
        ];
        
        console.log('필수 스크립트:', essentialScripts.length + '개');
        
        // 로드 순서 확인
        essentialScripts.forEach((scriptName, index) => {
            const script = document.querySelector(`script[src*="${scriptName}"]`);
            if (script) {
                console.log(`${index + 1}. ${scriptName} ✅`);
            } else {
                console.warn(`${index + 1}. ${scriptName} ❌ 없음`);
            }
        });
    }
    
    // ========== 7. 이벤트 리스너 최적화 ==========
    function optimizeEventListeners() {
        console.log('⚡ 이벤트 리스너 최적화');
        
        // 중복 클릭 이벤트 제거
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            // 기존 리스너 제거하고 새로 등록
            const newBtn = btn.cloneNode(true);
            
            // data 속성 복사
            Array.from(btn.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    newBtn.setAttribute(attr.name, attr.value);
                }
            });
            
            btn.parentNode?.replaceChild(newBtn, btn);
        });
        
        console.log('✅ 버튼 이벤트 최적화 완료');
    }
    
    // ========== 8. 상태 보고 ==========
    function reportStatus() {
        console.log('\n=== 🏁 정리 완료 보고서 ===');
        
        const report = {
            '스크립트 수': document.querySelectorAll('script').length,
            '모달 수': document.querySelectorAll('.modal').length,
            '글자 크기 버튼': document.querySelectorAll('#fontSizeDetailBtn').length,
            '색상 모드 버튼': document.querySelectorAll('#colorModeDetailBtn').length,
            '중복 themeModal': document.querySelectorAll('#themeModal').length,
            '활성 이벤트 리스너': getEventListeners ? Object.keys(getEventListeners(document)).length : '측정 불가'
        };
        
        console.table(report);
        
        console.log('\n=== 권장 사항 ===');
        console.log('1. HTML에서 다음 스크립트 제거:');
        scriptsToDisable.forEach(script => {
            console.log(`   - <script src="${script}"></script>`);
        });
        console.log('2. 브라우저 캐시 클리어 (Ctrl+Shift+R)');
        console.log('3. 페이지 새로고침');
        console.log('========================\n');
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 충돌 코드 정리 초기화');
        
        // 1. 중복 스크립트 제거
        removeConflictingScripts();
        
        // 2. 중복 핸들러 정리
        cleanupDuplicateHandlers();
        
        // 3. 중복 모달 제거
        removeDuplicateModals();
        
        // 4. 중복 함수 정리
        cleanupDuplicateFunctions();
        
        // 5. 콘솔 정리
        cleanupConsole();
        
        // 6. 필수 기능만 유지
        keepEssentialOnly();
        
        // 7. 이벤트 최적화
        optimizeEventListeners();
        
        // 8. 상태 보고
        setTimeout(reportStatus, 1000);
    }
    
    // 즉시 실행
    init();
    
    // 전역 유틸리티
    window.conflictCleanup = {
        run: init,
        report: reportStatus,
        removeScripts: removeConflictingScripts,
        removeModals: removeDuplicateModals
    };
    
    console.log('✅ 충돌 코드 정리 스크립트 로드 완료');
    console.log('💡 수동 실행: conflictCleanup.run()');
    
})();