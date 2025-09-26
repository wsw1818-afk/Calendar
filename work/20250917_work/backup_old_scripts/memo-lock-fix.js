// 메모 잠금 시스템 수정 스크립트
(function() {
    'use strict';

    console.log('🔒 메모 잠금 시스템 수정 스크립트 로드됨');

    // 잠금 상태 변수들 (전역 접근 가능하도록)
    let isMemosUnlocked = false;
    let isDateMemosUnlocked = false;

    // 기존 잠금 상태를 가져오는 함수
    function getLockStates() {
        // 기존 변수들이 있으면 사용
        if (typeof window.isMemosUnlocked !== 'undefined') {
            isMemosUnlocked = window.isMemosUnlocked;
        }
        if (typeof window.isDateMemosUnlocked !== 'undefined') {
            isDateMemosUnlocked = window.isDateMemosUnlocked;
        }

        console.log('현재 잠금 상태:', {
            isMemosUnlocked: isMemosUnlocked,
            isDateMemosUnlocked: isDateMemosUnlocked
        });
    }

    // 안전한 삭제 함수로 교체
    function createSafeDeleteFunction() {
        // deleteMemoFromList 함수를 안전하게 교체
        window.deleteMemoFromList = function(id) {
            console.log('🗑️ 메모 삭제 시도, ID:', id);
            
            // 잠금 상태 새로고침
            getLockStates();
            
            // 메모 리스트에서 클릭된 경우 - 일반 메모인지 날짜별 메모인지 확인
            const clickedElement = document.querySelector(`[onclick*="deleteMemoFromList(${id})"]`);
            let isDateMemo = false;
            
            if (clickedElement) {
                // 부모 컨테이너를 확인하여 어떤 리스트에서 클릭되었는지 판단
                const dateMemoContainer = clickedElement.closest('#dateMemoList');
                const stickyMemoContainer = clickedElement.closest('#stickyMemoList');
                const generalMemoContainer = clickedElement.closest('#memoList');
                
                if (dateMemoContainer) {
                    isDateMemo = true;
                    console.log('📅 날짜별 메모 삭제 시도');
                } else if (stickyMemoContainer || generalMemoContainer) {
                    isDateMemo = false;
                    console.log('📝 일반 메모 삭제 시도');
                }
            }

            // 잠금 상태 확인
            const isLocked = isDateMemo ? !isDateMemosUnlocked : !isMemosUnlocked;
            
            if (isLocked) {
                console.log('🔒 메모가 잠겨있어 삭제할 수 없습니다.');
                
                // 사용자에게 알림
                const lockType = isDateMemo ? '날짜별 메모' : '메모';
                alert(`🔒 ${lockType} 삭제가 잠겨있습니다.\n\n삭제하려면 먼저 잠금을 해제하세요.`);
                
                return; // 삭제 중단
            }

            console.log('🔓 잠금 해제 상태 - 삭제 진행');
            
            // 확인 메시지
            const memo = window.memos && window.memos.find(m => m.id == id);
            const memoTitle = memo ? memo.title : '이 메모';
            
            if (!confirm(`정말로 "${memoTitle}"를 삭제하시겠습니까?`)) {
                console.log('사용자가 삭제를 취소했습니다.');
                return;
            }

            // 실제 삭제 실행
            if (window.deleteMemo) {
                window.deleteMemo(id);
                console.log('✅ 메모 삭제 완료, ID:', id);
                
                // 화면 업데이트
                if (window.updateCalendarDisplay) {
                    window.updateCalendarDisplay();
                }
            } else {
                console.error('deleteMemo 함수를 찾을 수 없습니다.');
                alert('메모 삭제 중 오류가 발생했습니다.');
            }
        };

        console.log('✅ 안전한 deleteMemoFromList 함수로 교체 완료');
    }

    // 삭제 버튼 클릭 이벤트 강화
    function enhanceDeleteButtonEvents() {
        // 문서 전체에 이벤트 위임 설정
        document.addEventListener('click', function(event) {
            const deleteButton = event.target.closest('.memo-item-delete');
            
            if (deleteButton) {
                console.log('🎯 삭제 버튼 클릭 감지됨');
                
                // 기본 이벤트 차단
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                // 메모 ID 추출
                const onclick = deleteButton.getAttribute('onclick');
                if (onclick) {
                    const match = onclick.match(/deleteMemoFromList\((\d+)\)/);
                    if (match) {
                        const memoId = parseInt(match[1]);
                        console.log('추출된 메모 ID:', memoId);
                        
                        // 안전한 삭제 함수 호출
                        window.deleteMemoFromList(memoId);
                    }
                }
                
                return false;
            }
        }, true); // 캡처 단계에서 실행
        
        console.log('✅ 삭제 버튼 이벤트 강화 완료');
    }

    // 잠금 토글 버튼들 모니터링
    function monitorLockToggle() {
        // 잠금 토글 버튼들을 찾아서 상태 변경 감지
        const observerCallback = function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    // 메모 잠금 토글 버튼
                    if (target.id === 'memoLockToggle' || target.id === 'stickyMemoLockToggle') {
                        const isUnlocked = target.classList.contains('unlocked');
                        isMemosUnlocked = isUnlocked;
                        window.isMemosUnlocked = isUnlocked;
                        console.log('📝 메모 잠금 상태 변경:', isUnlocked ? '해제됨' : '잠김');
                    }
                    
                    // 날짜별 메모 잠금 토글 버튼
                    if (target.id === 'dateMemoLockToggle') {
                        const isUnlocked = target.classList.contains('unlocked');
                        isDateMemosUnlocked = isUnlocked;
                        window.isDateMemosUnlocked = isUnlocked;
                        console.log('📅 날짜별 메모 잠금 상태 변경:', isUnlocked ? '해제됨' : '잠김');
                    }
                }
            });
        };

        const observer = new MutationObserver(observerCallback);
        
        // 잠금 토글 버튼들 감시
        setTimeout(() => {
            const lockButtons = [
                '#memoLockToggle',
                '#stickyMemoLockToggle', 
                '#dateMemoLockToggle'
            ];
            
            lockButtons.forEach(selector => {
                const button = document.querySelector(selector);
                if (button) {
                    observer.observe(button, { 
                        attributes: true, 
                        attributeFilter: ['class'] 
                    });
                    console.log(`🔍 ${selector} 감시 시작`);
                }
            });
        }, 1000);
    }

    // 삭제 버튼 표시/숨김 강화
    function enhanceDeleteButtonVisibility() {
        // 주기적으로 삭제 버튼 상태 확인
        setInterval(() => {
            const deleteButtons = document.querySelectorAll('.memo-item-delete');
            
            deleteButtons.forEach(button => {
                const memoItem = button.closest('.memo-item');
                if (!memoItem) return;

                // 어떤 컨테이너에 속하는지 확인
                const isInDateMemoList = memoItem.closest('#dateMemoList');
                const isInStickyMemoList = memoItem.closest('#stickyMemoList');
                const isInMemoList = memoItem.closest('#memoList');

                let shouldShow = false;

                if (isInDateMemoList) {
                    shouldShow = isDateMemosUnlocked;
                } else if (isInStickyMemoList || isInMemoList) {
                    shouldShow = isMemosUnlocked;
                }

                // 버튼 표시/숨김
                if (shouldShow) {
                    button.classList.add('visible');
                    button.style.display = 'flex';
                } else {
                    button.classList.remove('visible');
                    button.style.display = 'none';
                }
            });
        }, 500);
    }

    // 디버깅 도구
    function addLockDebugTools() {
        window.debugLockSystem = function() {
            console.log('=== 🔒 잠금 시스템 디버깅 정보 ===');
            
            getLockStates();
            
            console.log('잠금 상태:');
            console.log('- 일반/스티키 메모:', isMemosUnlocked ? '🔓 해제됨' : '🔒 잠김');
            console.log('- 날짜별 메모:', isDateMemosUnlocked ? '🔓 해제됨' : '🔒 잠김');
            
            console.log('삭제 버튼 상태:');
            const deleteButtons = document.querySelectorAll('.memo-item-delete');
            console.log(`- 총 삭제 버튼 수: ${deleteButtons.length}`);
            console.log(`- 표시된 버튼 수: ${document.querySelectorAll('.memo-item-delete.visible').length}`);
            
            console.log('잠금 토글 버튼:');
            const lockButtons = ['#memoLockToggle', '#stickyMemoLockToggle', '#dateMemoLockToggle'];
            lockButtons.forEach(selector => {
                const btn = document.querySelector(selector);
                if (btn) {
                    console.log(`- ${selector}: ${btn.classList.contains('unlocked') ? '해제됨' : '잠김'}`);
                } else {
                    console.log(`- ${selector}: 찾을 수 없음`);
                }
            });
        };

        window.testDelete = function(id) {
            console.log('🧪 삭제 테스트, ID:', id);
            window.deleteMemoFromList(id);
        };

        console.log('✅ 잠금 시스템 디버깅 도구 추가: debugLockSystem(), testDelete(id)');
    }

    // 초기화
    function initialize() {
        console.log('🔒 메모 잠금 시스템 수정 초기화');
        
        // 잠금 상태 가져오기
        getLockStates();
        
        // 안전한 삭제 함수 생성
        createSafeDeleteFunction();
        
        // 삭제 버튼 이벤트 강화
        enhanceDeleteButtonEvents();
        
        // 잠금 토글 모니터링
        monitorLockToggle();
        
        // 삭제 버튼 표시/숨김 강화
        enhanceDeleteButtonVisibility();
        
        // 디버깅 도구 추가
        addLockDebugTools();
        
        console.log('✅ 메모 잠금 시스템 수정 완료');
        console.log('📋 디버깅: debugLockSystem() 명령어 사용 가능');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 지연 초기화 (다른 스크립트들이 로드된 후)
    setTimeout(initialize, 1500);

})();