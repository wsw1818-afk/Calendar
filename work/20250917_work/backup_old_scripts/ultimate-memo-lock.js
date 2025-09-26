// 궁극의 메모 잠금 시스템
(function() {
    'use strict';

    console.log('🔐 궁극의 메모 잠금 시스템 로드됨');

    // 잠금 상태 추적 시스템
    const lockState = {
        isMemosLocked: true,        // 기본적으로 잠김
        isDateMemosLocked: true,    // 기본적으로 잠김
        lastCheck: Date.now()
    };

    // 잠금 상태 실시간 감지
    function detectLockStates() {
        // DOM 요소에서 잠금 상태 확인
        const memoLockToggle = document.getElementById('memoLockToggle');
        const stickyMemoLockToggle = document.getElementById('stickyMemoLockToggle');
        const dateMemoLockToggle = document.getElementById('dateMemoLockToggle');

        // 메모 잠금 상태 (스티키 메모, 일반 메모)
        let isMemosUnlocked = false;
        if (memoLockToggle && memoLockToggle.classList.contains('unlocked')) {
            isMemosUnlocked = true;
        }
        if (stickyMemoLockToggle && stickyMemoLockToggle.classList.contains('unlocked')) {
            isMemosUnlocked = true;
        }
        
        // 전역 변수에서도 확인
        if (window.isMemosUnlocked === true) {
            isMemosUnlocked = true;
        }

        // 날짜별 메모 잠금 상태
        let isDateMemosUnlocked = false;
        if (dateMemoLockToggle && dateMemoLockToggle.classList.contains('unlocked')) {
            isDateMemosUnlocked = true;
        }
        if (window.isDateMemosUnlocked === true) {
            isDateMemosUnlocked = true;
        }

        // 상태 업데이트
        const prevMemoLock = lockState.isMemosLocked;
        const prevDateMemoLock = lockState.isDateMemosLocked;
        
        lockState.isMemosLocked = !isMemosUnlocked;
        lockState.isDateMemosLocked = !isDateMemosUnlocked;
        lockState.lastCheck = Date.now();

        // 상태 변경 시 로그
        if (prevMemoLock !== lockState.isMemosLocked || prevDateMemoLock !== lockState.isDateMemosLocked) {
            console.log('🔄 잠금 상태 변경됨:', {
                메모: lockState.isMemosLocked ? '🔒 잠김' : '🔓 해제됨',
                날짜별메모: lockState.isDateMemosLocked ? '🔒 잠김' : '🔓 해제됨'
            });
        }

        return {
            isMemosLocked: lockState.isMemosLocked,
            isDateMemosLocked: lockState.isDateMemosLocked
        };
    }

    // 절대 삭제 차단 시스템
    function createAbsoluteDeleteBlocker() {
        // 모든 삭제 관련 함수들을 가로채기
        const originalDeleteMemo = window.deleteMemo;
        const originalDeleteMemoFromList = window.deleteMemoFromList;

        // deleteMemo 함수 완전 차단
        window.deleteMemo = function(id) {
            console.log('🚨 deleteMemo 호출 차단 시도, ID:', id);
            
            const states = detectLockStates();
            
            // 메모가 어느 리스트에서 삭제되는지 추적
            const clickedButton = document.querySelector(`[onclick*="deleteMemo(${id})"], [onclick*="deleteMemoFromList(${id})"]`);
            let isFromDateMemoList = false;
            
            if (clickedButton) {
                isFromDateMemoList = !!clickedButton.closest('#dateMemoList');
            }

            const isLocked = isFromDateMemoList ? states.isDateMemosLocked : states.isMemosLocked;
            const listType = isFromDateMemoList ? '날짜별 메모' : '메모';

            if (isLocked) {
                console.log('🔒 삭제 완전 차단됨:', listType, 'ID:', id);
                
                // 강력한 사용자 알림
                const memo = (window.memos || []).find(m => m.id == id);
                const memoTitle = memo ? memo.title : '이 메모';
                
                alert(`🔒 ${listType} 삭제가 잠겨있습니다!\n\n"${memoTitle}"를 삭제하려면 먼저 🔓 잠금을 해제하세요.\n\n현재 상태: 🔒 잠김`);
                
                return false; // 삭제 중단
            }

            console.log('🔓 잠금 해제됨 - 삭제 진행 허용:', listType, 'ID:', id);
            
            // 잠금이 해제된 경우에만 원래 함수 실행
            if (originalDeleteMemo) {
                return originalDeleteMemo.call(this, id);
            }
        };

        // deleteMemoFromList 함수 완전 차단
        window.deleteMemoFromList = function(id) {
            console.log('🚨 deleteMemoFromList 호출 차단 시도, ID:', id);
            
            const states = detectLockStates();
            
            // 클릭된 요소 추적
            const clickedElement = event ? event.target : null;
            let isFromDateMemoList = false;
            
            if (clickedElement) {
                isFromDateMemoList = !!clickedElement.closest('#dateMemoList');
            } else {
                // 이벤트가 없으면 DOM에서 찾기
                const deleteButton = document.querySelector(`[onclick*="deleteMemoFromList(${id})"]`);
                if (deleteButton) {
                    isFromDateMemoList = !!deleteButton.closest('#dateMemoList');
                }
            }

            const isLocked = isFromDateMemoList ? states.isDateMemosLocked : states.isMemosLocked;
            const listType = isFromDateMemoList ? '날짜별 메모' : '메모';

            if (isLocked) {
                console.log('🔒 리스트 삭제 완전 차단됨:', listType, 'ID:', id);
                
                // 매우 명확한 사용자 알림
                const memo = (window.memos || []).find(m => m.id == id);
                const memoTitle = memo ? memo.title : '이 메모';
                
                // 잠금 해제 방법 안내
                const unlockMethod = isFromDateMemoList ? 
                    '날짜별 메모 리스트 상단의 🔒 버튼을 클릭하여 해제하세요.' :
                    '메모 리스트 상단의 🔒 버튼을 클릭하여 해제하세요.';
                
                alert(`🔒 ${listType} 삭제가 잠겨있습니다!\n\n"${memoTitle}"를 삭제할 수 없습니다.\n\n🔓 잠금 해제 방법:\n${unlockMethod}\n\n현재 상태: 🔒 잠김`);
                
                // 시각적 효과 (버튼을 잠깐 빨갛게)
                if (clickedElement && clickedElement.classList.contains('memo-item-delete')) {
                    clickedElement.style.background = '#ff0000';
                    clickedElement.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        clickedElement.style.background = '';
                        clickedElement.style.animation = '';
                    }, 500);
                }
                
                return false; // 삭제 중단
            }

            console.log('🔓 잠금 해제됨 - 리스트 삭제 진행 허용:', listType, 'ID:', id);
            
            // 잠금이 해제된 경우에만 원래 함수 실행
            if (originalDeleteMemoFromList) {
                return originalDeleteMemoFromList.call(this, id);
            } else if (originalDeleteMemo) {
                return originalDeleteMemo.call(this, id);
            }
        };

        console.log('✅ 절대 삭제 차단 시스템 활성화');
    }

    // 삭제 버튼 완전 비활성화 시스템
    function enforceDeleteButtonState() {
        const deleteButtons = document.querySelectorAll('.memo-item-delete');
        const states = detectLockStates();
        
        deleteButtons.forEach(button => {
            const memoItem = button.closest('.memo-item');
            if (!memoItem) return;

            // 어떤 리스트에 속하는지 확인
            const isInDateMemoList = !!memoItem.closest('#dateMemoList');
            const isInOtherLists = !!memoItem.closest('#stickyMemoList, #memoList');
            
            const shouldBeDisabled = isInDateMemoList ? states.isDateMemosLocked : states.isMemosLocked;

            if (shouldBeDisabled) {
                // 완전 비활성화
                button.style.display = 'none';
                button.style.pointerEvents = 'none';
                button.disabled = true;
                button.classList.remove('visible');
                button.classList.add('locked');
                
                // 추가 보안: onclick 이벤트 제거
                button.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    const listType = isInDateMemoList ? '날짜별 메모' : '메모';
                    alert(`🔒 ${listType} 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.`);
                    return false;
                };
                
            } else {
                // 활성화
                button.style.display = 'flex';
                button.style.pointerEvents = 'auto';
                button.disabled = false;
                button.classList.add('visible');
                button.classList.remove('locked');
            }
        });
    }

    // 잠금 상태 시각적 강화
    function enhanceVisualLockIndicators() {
        // CSS 스타일 추가
        if (!document.querySelector('#ultimate-lock-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ultimate-lock-styles';
            styles.textContent = `
                /* 잠긴 메모 아이템 스타일 */
                .memo-item.locked {
                    position: relative;
                    opacity: 0.7;
                }
                
                .memo-item.locked::before {
                    content: '🔒';
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: rgba(255, 0, 0, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 10;
                }
                
                .memo-item.locked:hover::after {
                    content: '잠금 상태 - 삭제 불가능';
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    white-space: nowrap;
                    z-index: 1000;
                }
                
                .memo-item-delete.locked {
                    background: #ccc !important;
                    cursor: not-allowed !important;
                    display: none !important;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
                
                .locked-indicator {
                    display: inline-block;
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(styles);
        }

        // 메모 아이템에 잠금 상태 클래스 추가
        const states = detectLockStates();
        
        document.querySelectorAll('.memo-item').forEach(item => {
            const isInDateMemoList = !!item.closest('#dateMemoList');
            const isLocked = isInDateMemoList ? states.isDateMemosLocked : states.isMemosLocked;
            
            if (isLocked) {
                item.classList.add('locked');
            } else {
                item.classList.remove('locked');
            }
        });
    }

    // 이벤트 가로채기 시스템
    function interceptDeleteEvents() {
        // 모든 클릭 이벤트를 최우선으로 가로채기
        document.addEventListener('click', function(e) {
            const deleteButton = e.target.closest('.memo-item-delete');
            
            if (deleteButton) {
                console.log('🚨 삭제 버튼 클릭 감지 - 즉시 차단 검사');
                
                const states = detectLockStates();
                const isInDateMemoList = !!deleteButton.closest('#dateMemoList');
                const isLocked = isInDateMemoList ? states.isDateMemosLocked : states.isMemosLocked;
                
                if (isLocked) {
                    console.log('🔒 클릭 이벤트 단계에서 차단됨');
                    
                    // 모든 이벤트 완전 차단
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    const listType = isInDateMemoList ? '날짜별 메모' : '메모';
                    alert(`🔒 ${listType} 삭제가 잠겨있습니다!\n\n🔓 잠금을 먼저 해제하세요.`);
                    
                    return false;
                }
                
                console.log('🔓 삭제 버튼 클릭 허용됨');
            }
        }, true); // 캡처 단계에서 최우선 실행
    }

    // 실시간 모니터링 시스템
    function startRealTimeMonitoring() {
        setInterval(() => {
            detectLockStates();
            enforceDeleteButtonState();
            enhanceVisualLockIndicators();
        }, 500); // 0.5초마다 검사
    }

    // 디버깅 도구
    function addUltimateLockDebugTools() {
        window.ultimateLockStatus = function() {
            const states = detectLockStates();
            
            console.log('=== 🔐 궁극의 잠금 시스템 상태 ===');
            console.log('메모 잠금:', states.isMemosLocked ? '🔒 잠김' : '🔓 해제됨');
            console.log('날짜별 메모 잠금:', states.isDateMemosLocked ? '🔒 잠김' : '🔓 해제됨');
            console.log('마지막 검사:', new Date(lockState.lastCheck).toLocaleTimeString());
            
            const deleteButtons = document.querySelectorAll('.memo-item-delete');
            const hiddenButtons = document.querySelectorAll('.memo-item-delete[style*="display: none"]');
            console.log(`삭제 버튼: 총 ${deleteButtons.length}개, 숨김 ${hiddenButtons.length}개`);
            
            return states;
        };

        window.forceUnlockAll = function() {
            console.log('🚨 강제 잠금 해제 (디버깅용)');
            window.isMemosUnlocked = true;
            window.isDateMemosUnlocked = true;
            
            detectLockStates();
            enforceDeleteButtonState();
            enhanceVisualLockIndicators();
            
            console.log('✅ 모든 잠금이 강제로 해제되었습니다');
        };

        window.forceLockAll = function() {
            console.log('🔒 강제 잠금 활성화 (디버깅용)');
            window.isMemosUnlocked = false;
            window.isDateMemosUnlocked = false;
            
            detectLockStates();
            enforceDeleteButtonState();
            enhanceVisualLockIndicators();
            
            console.log('🔒 모든 메모가 강제로 잠겼습니다');
        };

        console.log('✅ 궁극의 잠금 디버깅 도구 추가');
        console.log('📋 명령어: ultimateLockStatus(), forceUnlockAll(), forceLockAll()');
    }

    // 초기화
    function initialize() {
        console.log('🔐 궁극의 메모 잠금 시스템 초기화');
        
        // 초기 잠금 상태 감지
        detectLockStates();
        
        // 절대 삭제 차단 시스템 활성화
        createAbsoluteDeleteBlocker();
        
        // 삭제 버튼 상태 강제 적용
        enforceDeleteButtonState();
        
        // 시각적 표시 강화
        enhanceVisualLockIndicators();
        
        // 이벤트 가로채기
        interceptDeleteEvents();
        
        // 실시간 모니터링 시작
        startRealTimeMonitoring();
        
        // 디버깅 도구 추가
        addUltimateLockDebugTools();
        
        console.log('🔐 궁극의 메모 잠금 시스템 초기화 완료');
        console.log('🛡️ 다중 보안 계층 활성화됨');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 즉시 초기화
    initialize();

    // 지연 초기화 (모든 다른 스크립트 로드 후)
    setTimeout(initialize, 2000);

})();