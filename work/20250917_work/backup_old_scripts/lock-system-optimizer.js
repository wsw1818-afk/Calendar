// 잠금 시스템 최적화 - 불필요한 UI 새로고침 방지 (현재 비활성화)

(function() {
    'use strict';
    
    console.log('🔐 잠금 시스템 최적화 로드됨 (비활성화 모드)');
    
    // 최적화 시스템을 완전히 비활성화하고 기본 HTML 기능만 사용
    console.log('⚠️ 최적화 시스템 비활성화 - 기본 HTML 잠금 기능 사용');
    
    return; // 여기서 스크립트 종료
    
    // 원본 함수들 백업
    const originalLoadMemos = window.loadMemos;
    const originalMemoSystemRefresh = window.MemoSystem ? window.MemoSystem.refresh : null;
    
    // 잠금 토글 중 플래그
    let isLockToggling = false;
    
    // loadMemos 함수 래핑 - 잠금 토글 중에는 실행 안함
    if (originalLoadMemos) {
        window.loadMemos = function() {
            if (isLockToggling) {
                console.log('🔐 잠금 토글 중 - loadMemos 스킵');
                return;
            }
            return originalLoadMemos.apply(this, arguments);
        };
    }
    
    // MemoSystem.refresh 래핑 - 잠금 토글 중에는 실행 안함
    if (originalMemoSystemRefresh && window.MemoSystem) {
        window.MemoSystem.refresh = function() {
            if (isLockToggling) {
                console.log('🔐 잠금 토글 중 - MemoSystem.refresh 스킵');
                return;
            }
            return originalMemoSystemRefresh.apply(this, arguments);
        };
    }
    
    // 잠금 토글 이벤트 최적화 - 초기 정의만
    function optimizeLockToggles() {
        // 실제 구현은 아래에서 재정의됨
    }
    
    // DOM 감시자 - 새로운 잠금 버튼이 추가되면 자동 최적화
    // 최적화된 버튼 추적을 위한 WeakSet
    const optimizedButtons = new WeakSet();
    
    // 최적화 함수 수정 - 이미 최적화된 버튼은 건너뛰기
    const originalOptimizeLockToggles = optimizeLockToggles;
    optimizeLockToggles = function() {
        const lockButtons = document.querySelectorAll('.memo-lock-toggle');
        
        lockButtons.forEach(button => {
            // 이미 최적화된 버튼은 건너뛰기
            if (optimizedButtons.has(button)) {
                return;
            }
            
            // 기존 이벤트 제거하고 최적화된 버전 추가
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 최적화된 버튼으로 표시
            optimizedButtons.add(newButton);
            newButton.dataset.optimized = 'true';
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 잠금 토글 시작
                isLockToggling = true;
                
                const isDateMemo = this.closest('#dateMemoList') !== null;
                
                if (isDateMemo) {
                    // 날짜별 메모 잠금 토글
                    window.isDateMemosUnlocked = !window.isDateMemosUnlocked;
                    this.classList.toggle('unlocked');
                    this.textContent = window.isDateMemosUnlocked ? '🔓' : '🔒';
                    console.log('📅 날짜별 메모 잠금 상태:', window.isDateMemosUnlocked ? '해제' : '잠김');
                    
                    // 날짜별 메모 리스트만 업데이트
                    if (window.displayDateMemos) {
                        const selectedDate = window.selectedDate || new Date().toISOString().split('T')[0];
                        window.displayDateMemos(selectedDate);
                    }
                } else {
                    // 일반 메모 잠금 토글
                    window.isMemosUnlocked = !window.isMemosUnlocked;
                    this.classList.toggle('unlocked');
                    this.textContent = window.isMemosUnlocked ? '🔓' : '🔒';
                    console.log('📝 일반 메모 잠금 상태:', window.isMemosUnlocked ? '해제' : '잠김');
                }
                
                // 잠금 토글 완료
                setTimeout(() => {
                    isLockToggling = false;
                }, 100);
            });
        });
        
        console.log('🔐 잠금 토글 버튼 최적화 완료:', lockButtons.length - document.querySelectorAll('[data-optimized="true"]').length, '개 새로 최적화');
    };
    
    // Debounce 함수 추가
    let debounceTimer;
    function debounceOptimize() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            optimizeLockToggles();
        }, 300);
    }
    
    const observer = new MutationObserver((mutations) => {
        let hasNewLockButton = false;
        
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // data-optimized가 없는 새로운 버튼만 확인
                        if (node.classList && node.classList.contains('memo-lock-toggle') && !node.dataset.optimized) {
                            hasNewLockButton = true;
                        }
                        if (node.querySelector) {
                            const newButtons = node.querySelectorAll('.memo-lock-toggle:not([data-optimized])');
                            if (newButtons.length > 0) {
                                hasNewLockButton = true;
                            }
                        }
                    }
                });
            }
        });
        
        if (hasNewLockButton) {
            debounceOptimize();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 초기화
    function initialize() {
        // 기존 메모 리스트 숨기기
        const memoLists = document.querySelectorAll('#memoList, #stickyMemoList, .memo-list');
        memoLists.forEach(list => {
            if (!list.closest('#dateMemoModal') && !list.closest('.memo-modal')) {
                list.style.display = 'none';
                console.log('🔐 메모 리스트 숨김:', list.id || list.className);
            }
        });
        
        // 잠금 토글 최적화
        setTimeout(optimizeLockToggles, 500);
        
        console.log('✅ 잠금 시스템 최적화 완료');
    }
    
    // 페이지 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();