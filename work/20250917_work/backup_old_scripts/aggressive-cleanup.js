/**
 * 강력한 충돌 코드 정리 스크립트
 * - 즉시 실행되어 문제 코드 차단
 * - 브라우저 캐시에서도 무력화
 */

(function() {
    'use strict';
    
    console.log('🚨 강력한 충돌 정리 시작 (AGGRESSIVE MODE)');
    
    // ========== 1. 문제 스크립트 즉시 차단 ==========
    const blockedScripts = [
        'debug-font-modal.js',
        'enhanced-debug-font-modal.js', 
        'fix-duplicate-modal.js',
        'final-integration-fix.js'
    ];
    
    // 스크립트 로드 차단
    const originalAppendChild = Node.prototype.appendChild;
    const originalInsertBefore = Node.prototype.insertBefore;
    
    Node.prototype.appendChild = function(child) {
        if (child.tagName === 'SCRIPT' && child.src) {
            for (const blocked of blockedScripts) {
                if (child.src.includes(blocked)) {
                    console.warn(`🚫 차단됨: ${blocked}`);
                    return child;
                }
            }
        }
        return originalAppendChild.call(this, child);
    };
    
    Node.prototype.insertBefore = function(child, ref) {
        if (child.tagName === 'SCRIPT' && child.src) {
            for (const blocked of blockedScripts) {
                if (child.src.includes(blocked)) {
                    console.warn(`🚫 차단됨: ${blocked}`);
                    return child;
                }
            }
        }
        return originalInsertBefore.call(this, child, ref);
    };
    
    // ========== 2. 이미 로드된 스크립트 제거 ==========
    function removeLoadedScripts() {
        console.log('🗑️ 로드된 문제 스크립트 제거');
        
        const scripts = document.querySelectorAll('script');
        let removed = 0;
        
        scripts.forEach(script => {
            blockedScripts.forEach(blocked => {
                if (script.src && script.src.includes(blocked)) {
                    console.log(`제거: ${blocked}`);
                    script.remove();
                    removed++;
                }
            });
        });
        
        console.log(`총 ${removed}개 스크립트 제거됨`);
    }
    
    // ========== 3. 문제 함수들 무력화 ==========
    function disableProblematicFunctions() {
        console.log('🔨 문제 함수 무력화');
        
        // 디버그 함수들 무력화
        if (window.debugFontModal) {
            window.debugFontModal = function() {
                console.warn('debugFontModal 비활성화됨');
            };
        }
        
        if (window.enhancedDebugFontModal) {
            window.enhancedDebugFontModal = function() {
                console.warn('enhancedDebugFontModal 비활성화됨');
            };
        }
        
        if (window.fixModalIssues) {
            window.fixModalIssues = function() {
                console.warn('fixModalIssues 비활성화됨');
            };
        }
        
        // console.error 오버라이드 제거
        if (console._originalError) {
            console.error = console._originalError;
            delete console._originalError;
        }
        
        // 기존 오버라이드된 console.error 복원
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.textContent && script.textContent.includes('console.error = function')) {
                script.remove();
                console.log('console.error 오버라이드 스크립트 제거');
            }
        });
    }
    
    // ========== 4. 중복 요소 강제 제거 ==========
    function forceRemoveDuplicates() {
        console.log('💥 중복 요소 강제 제거');
        
        // 중복 모달 제거
        const modalIds = ['fontSizeModal', 'colorModeModal', 'themeModal'];
        modalIds.forEach(id => {
            const elements = document.querySelectorAll(`#${id}`);
            if (elements.length > 1) {
                console.log(`${id} 중복 ${elements.length}개 발견`);
                // 마지막 것만 남기고 제거 (최신 버전일 가능성 높음)
                for (let i = 0; i < elements.length - 1; i++) {
                    elements[i].remove();
                }
            }
        });
        
        // 중복 버튼 제거
        const buttonIds = ['fontSizeDetailBtn', 'colorModeDetailBtn'];
        buttonIds.forEach(id => {
            const buttons = document.querySelectorAll(`#${id}`);
            if (buttons.length > 1) {
                console.log(`${id} 버튼 ${buttons.length}개 발견`);
                // 첫 번째만 남기고 제거
                for (let i = 1; i < buttons.length; i++) {
                    buttons[i].remove();
                }
            }
        });
    }
    
    // ========== 5. 이벤트 핸들러 정리 ==========
    function cleanupEventHandlers() {
        console.log('🧹 이벤트 핸들러 정리');
        
        // 글자 크기 버튼 정리
        const fontBtn = document.getElementById('fontSizeDetailBtn');
        if (fontBtn && !fontBtn.dataset.cleanedUp) {
            // 모든 이벤트 제거
            const newBtn = fontBtn.cloneNode(true);
            newBtn.dataset.cleanedUp = 'true';
            
            // 단일 이벤트만 추가
            newBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ 정리된 글자 크기 버튼 클릭');
                
                if (window.AdvancedControls?.openFontSizeModal) {
                    try {
                        window.AdvancedControls.openFontSizeModal();
                    } catch (err) {
                        console.error('모달 열기 실패:', err);
                        if (window.openEmergencyFontModal) {
                            window.openEmergencyFontModal('fallback');
                        }
                    }
                } else if (window.openEmergencyFontModal) {
                    window.openEmergencyFontModal('fallback');
                }
            };
            
            fontBtn.parentNode?.replaceChild(newBtn, fontBtn);
            console.log('글자 크기 버튼 핸들러 정리됨');
        }
    }
    
    // ========== 6. DOM 변경 감시 및 차단 ==========
    function setupMutationBlocker() {
        console.log('👁️ DOM 변경 감시 시작');
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'SCRIPT') {
                        blockedScripts.forEach(blocked => {
                            if (node.src && node.src.includes(blocked)) {
                                console.warn(`🚫 동적 로드 차단: ${blocked}`);
                                node.remove();
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    // ========== 7. 주기적 정리 ==========
    function setupPeriodicCleanup() {
        console.log('⏰ 주기적 정리 설정');
        
        // 3초마다 정리
        setInterval(() => {
            forceRemoveDuplicates();
            
            // 문제 스크립트가 다시 로드되었는지 확인
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                blockedScripts.forEach(blocked => {
                    if (script.src && script.src.includes(blocked)) {
                        console.warn(`재로드 감지 및 제거: ${blocked}`);
                        script.remove();
                    }
                });
            });
        }, 3000);
    }
    
    // ========== 8. 상태 보고 ==========
    function reportStatus() {
        console.log('\n=== 🔍 시스템 상태 보고 ===');
        
        const status = {
            '총 스크립트 수': document.querySelectorAll('script').length,
            '문제 스크립트': document.querySelectorAll(blockedScripts.map(s => `script[src*="${s}"]`).join(',')).length,
            '중복 fontSizeModal': document.querySelectorAll('#fontSizeModal').length,
            '중복 글자 크기 버튼': document.querySelectorAll('#fontSizeDetailBtn').length,
            '활성 모달': document.querySelectorAll('.modal:not([style*="display: none"])').length
        };
        
        console.table(status);
        
        // 문제 스크립트 목록
        const problemScripts = [];
        document.querySelectorAll('script').forEach(script => {
            blockedScripts.forEach(blocked => {
                if (script.src && script.src.includes(blocked)) {
                    problemScripts.push(blocked);
                }
            });
        });
        
        if (problemScripts.length > 0) {
            console.error('⚠️ 아직 로드된 문제 스크립트:', problemScripts);
            console.log('브라우저 캐시를 완전히 클리어하세요:');
            console.log('1. F12 개발자 도구 열기');
            console.log('2. Network 탭에서 "Disable cache" 체크');
            console.log('3. Ctrl+Shift+R로 강제 새로고침');
        } else {
            console.log('✅ 모든 문제 스크립트가 제거됨');
        }
        
        console.log('=========================\n');
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 강력한 정리 초기화 (AGGRESSIVE)');
        
        // 1. 로드된 스크립트 제거
        removeLoadedScripts();
        
        // 2. 문제 함수 무력화
        disableProblematicFunctions();
        
        // 3. 중복 요소 강제 제거
        forceRemoveDuplicates();
        
        // 4. 이벤트 핸들러 정리
        cleanupEventHandlers();
        
        // 5. DOM 감시 설정
        setupMutationBlocker();
        
        // 6. 주기적 정리 설정
        setupPeriodicCleanup();
        
        // 7. 1초 후 상태 보고
        setTimeout(reportStatus, 1000);
        
        console.log('✅ 강력한 정리 완료');
    }
    
    // 즉시 실행
    init();
    
    // 전역 유틸리티
    window.aggressiveCleanup = {
        run: init,
        status: reportStatus,
        forceRemove: forceRemoveDuplicates,
        block: function(scriptName) {
            if (!blockedScripts.includes(scriptName)) {
                blockedScripts.push(scriptName);
                console.log(`추가 차단: ${scriptName}`);
            }
        }
    };
    
    console.log('✅ 강력한 정리 스크립트 활성화');
    console.log('💡 상태 확인: aggressiveCleanup.status()');
    console.log('💡 강제 실행: aggressiveCleanup.run()');
    
})();