// 메모 즉시 삭제 스크립트 (확인 창 없이)
(function() {
    'use strict';

    console.log('⚡ 메모 즉시 삭제 시스템 로드됨');

    // 모든 삭제 관련 함수에서 확인 창 제거
    function removeConfirmDialogs() {
        
        // 1. deleteMemoFromList 함수 - 확인 창 없이 즉시 삭제
        window.deleteMemoFromList = function(id) {
            console.log('🗑️ 즉시 삭제 시작, ID:', id);
            
            // 잠금 상태 확인 (잠금 시에만 알림, 삭제는 차단)
            const clickedElement = event ? event.target : null;
            let isFromDateMemoList = false;
            
            if (clickedElement) {
                isFromDateMemoList = !!clickedElement.closest('#dateMemoList');
            } else {
                const deleteButton = document.querySelector(`[onclick*="deleteMemoFromList(${id})"]`);
                if (deleteButton) {
                    isFromDateMemoList = !!deleteButton.closest('#dateMemoList');
                }
            }

            const isMemosLocked = !window.isMemosUnlocked;
            const isDateMemosLocked = !window.isDateMemosUnlocked;
            const isLocked = isFromDateMemoList ? isDateMemosLocked : isMemosLocked;

            if (isLocked) {
                const listType = isFromDateMemoList ? '날짜별 메모' : '메모';
                alert(`🔒 ${listType} 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.`);
                return false;
            }

            // 확인 창 없이 바로 삭제 실행
            if (window.deleteMemo) {
                window.deleteMemo(id);
                console.log('✅ 즉시 삭제 완료, ID:', id);
            } else {
                console.error('deleteMemo 함수를 찾을 수 없습니다.');
            }
        };

        // 2. 메모 상세 모달의 삭제 버튼 - 잠금 상태 확인 후 즉시 삭제
        window.updateDetailModalDeleteButton = function() {
            const deleteBtn = document.getElementById('deleteMemoBtn');
            if (deleteBtn) {
                deleteBtn.onclick = function() {
                    if (window.currentMemoId) {
                        console.log('🗑️ 상세 모달에서 즉시 삭제 요청, ID:', window.currentMemoId);
                        
                        // 메모 정보 가져오기
                        const memos = window.memos || [];
                        const memo = memos.find(m => m.id == window.currentMemoId);
                        if (!memo) {
                            console.error('메모를 찾을 수 없습니다:', window.currentMemoId);
                            return;
                        }
                        
                        // 잠금 상태 확인
                        const currentDate = window.selectedDate;
                        const isDateMemo = memo.date === currentDate;
                        const isMemosLocked = !window.isMemosUnlocked;
                        const isDateMemosLocked = !window.isDateMemosUnlocked;
                        
                        if (isDateMemo && isDateMemosLocked) {
                            alert('🔒 날짜별 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                            return;
                        } else if (!isDateMemo && isMemosLocked) {
                            alert('🔒 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                            return;
                        }
                        
                        console.log('🔓 잠금 해제 상태 - 즉시 삭제 진행:', memo.title);
                        
                        // 잠금이 해제된 경우에만 즉시 삭제
                        if (window.deleteMemo) {
                            window.deleteMemo(window.currentMemoId);
                            
                            // 모달 닫기
                            if (window.closeMemoDetail) {
                                window.closeMemoDetail();
                            }
                            
                            // 리스트 업데이트
                            setTimeout(() => {
                                if (window.updateCalendarDisplay) window.updateCalendarDisplay();
                                if (window.displayStickyMemos) window.displayStickyMemos();
                                if (window.updateMemoList) window.updateMemoList();
                            }, 100);
                            
                            console.log('✅ 상세 모달 즉시 삭제 완료');
                        }
                    }
                };
                console.log('✅ 상세 모달 삭제 버튼 잠금 확인 후 즉시 삭제로 업데이트');
            }
        };

        // 3. 기본 deleteMemo 함수는 그대로 유지 (이미 확인 창이 없음)
        
        // 4. 기존에 추가된 확인 창들 제거
        const originalDeleteMemo = window.deleteMemo;
        if (originalDeleteMemo) {
            window.deleteMemo = function(id) {
                console.log('🗑️ deleteMemo 호출됨 (확인 창 제거 버전), ID:', id);
                
                // 최신 메모 데이터 로드
                let memos = [];
                try {
                    const stored = localStorage.getItem('calendarMemos');
                    if (stored) {
                        memos = JSON.parse(stored);
                        window.memos = memos;
                        window.allMemos = memos;
                    }
                } catch (error) {
                    console.error('메모 데이터 로드 실패:', error);
                    memos = window.memos || [];
                }

                const beforeCount = memos.length;
                
                // 메모 삭제 (확인 창 없이)
                const filteredMemos = memos.filter(m => m.id != id);
                const afterCount = filteredMemos.length;
                
                if (beforeCount === afterCount) {
                    console.warn('삭제할 메모를 찾지 못했습니다. ID:', id);
                    return;
                }
                
                // 전역 변수 및 localStorage 업데이트
                window.memos = filteredMemos;
                window.allMemos = filteredMemos;
                
                try {
                    localStorage.setItem('calendarMemos', JSON.stringify(filteredMemos));
                    console.log('✅ 메모 삭제 및 저장 완료:', beforeCount, '→', afterCount);
                } catch (error) {
                    console.error('localStorage 업데이트 실패:', error);
                }
                
                // UI 업데이트
                setTimeout(() => {
                    if (window.loadMemos) {
                        try { window.loadMemos(); } catch (e) {}
                    }
                    if (window.displayStickyMemos) {
                        try { window.displayStickyMemos(); } catch (e) {}
                    }
                    if (window.displayDateMemos) {
                        try { window.displayDateMemos(); } catch (e) {}
                    }
                    if (window.updateCalendarDisplay) {
                        try { window.updateCalendarDisplay(); } catch (e) {}
                    }
                }, 100);
            };
        }

        console.log('✅ 모든 삭제 함수에서 확인 창 제거 완료');
    }

    // 기존 잠금 시스템에서 확인 창 제거
    function updateLockSystem() {
        // memo-lock-fix.js와 ultimate-memo-lock.js에서 추가한 확인 창들 제거
        
        // 궁극의 잠금 시스템의 deleteMemoFromList 함수 수정
        setTimeout(() => {
            if (window.deleteMemoFromList) {
                const originalFunc = window.deleteMemoFromList;
                
                window.deleteMemoFromList = function(id) {
                    console.log('🗑️ 잠금 시스템 - 즉시 삭제 확인, ID:', id);
                    
                    // 잠금 상태 확인
                    const clickedElement = event ? event.target : null;
                    let isFromDateMemoList = false;
                    
                    if (clickedElement) {
                        isFromDateMemoList = !!clickedElement.closest('#dateMemoList');
                    }

                    const isMemosLocked = !window.isMemosUnlocked;
                    const isDateMemosLocked = !window.isDateMemosUnlocked;
                    const isLocked = isFromDateMemoList ? isDateMemosLocked : isMemosLocked;

                    if (isLocked) {
                        const listType = isFromDateMemoList ? '날짜별 메모' : '메모';
                        alert(`🔒 ${listType} 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.`);
                        return false;
                    }

                    // 잠금이 해제된 상태면 확인 창 없이 바로 삭제
                    console.log('🔓 잠금 해제됨 - 즉시 삭제 진행');
                    
                    if (window.deleteMemo) {
                        window.deleteMemo(id);
                    }
                };
            }
        }, 500);

        console.log('✅ 잠금 시스템 확인 창 제거 완료');
    }

    // 모든 기존 확인 창 제거
    function removeAllExistingConfirms() {
        // 전역적으로 confirm 함수 일시 비활성화 (메모 삭제 시에만)
        let isDeleting = false;
        const originalConfirm = window.confirm;
        
        window.confirm = function(message) {
            // 메모 삭제 관련 확인창은 무시
            if (message && (
                message.includes('삭제') || 
                message.includes('delete') || 
                message.includes('메모') ||
                message.includes('정말로')
            )) {
                console.log('🚫 메모 삭제 확인창 무시됨:', message.substring(0, 30) + '...');
                return true; // 항상 승인으로 처리
            }
            
            // 다른 확인창은 정상 처리
            return originalConfirm.call(this, message);
        };

        console.log('✅ 메모 삭제 관련 확인창 전역 비활성화');
    }

    // 시각적 즉시 삭제 피드백
    function addInstantDeleteVisualFeedback() {
        if (!document.querySelector('#instant-delete-styles')) {
            const styles = document.createElement('style');
            styles.id = 'instant-delete-styles';
            styles.textContent = `
                .memo-item-delete:hover {
                    background: #ff4757 !important;
                    transform: scale(1.1) !important;
                    transition: all 0.1s ease !important;
                }
                
                .memo-item-delete:active {
                    background: #ff3742 !important;
                    transform: scale(0.95) !important;
                }
                
                .memo-item.instant-deleting {
                    opacity: 0;
                    transform: scale(0.8) translateX(50px);
                    transition: all 0.2s ease;
                    pointer-events: none;
                }
                
                .memo-item-delete::after {
                    content: '즉시삭제';
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    background: #ff4757;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease;
                }
                
                .memo-item-delete:hover::after {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // 즉시 삭제 애니메이션 적용
    function applyInstantDeleteAnimation() {
        document.addEventListener('click', function(e) {
            const deleteButton = e.target.closest('.memo-item-delete');
            if (deleteButton) {
                const memoItem = deleteButton.closest('.memo-item');
                if (memoItem) {
                    // 즉시 삭제 애니메이션 적용
                    memoItem.classList.add('instant-deleting');
                    console.log('✨ 즉시 삭제 애니메이션 적용됨');
                }
            }
        });
    }

    // 디버깅 도구
    function addInstantDeleteDebugTools() {
        window.testInstantDelete = function(id) {
            console.log('🧪 즉시 삭제 테스트, ID:', id);
            if (window.deleteMemoFromList) {
                window.deleteMemoFromList(id);
            } else if (window.deleteMemo) {
                window.deleteMemo(id);
            } else {
                console.error('삭제 함수를 찾을 수 없습니다.');
            }
        };

        window.checkDeleteFunctions = function() {
            console.log('=== 🗑️ 삭제 함수 확인 ===');
            console.log('deleteMemo:', typeof window.deleteMemo);
            console.log('deleteMemoFromList:', typeof window.deleteMemoFromList);
            
            const deleteButtons = document.querySelectorAll('.memo-item-delete');
            console.log('삭제 버튼 개수:', deleteButtons.length);
            
            return {
                deleteMemo: window.deleteMemo,
                deleteMemoFromList: window.deleteMemoFromList,
                deleteButtonCount: deleteButtons.length
            };
        };

        console.log('✅ 즉시 삭제 디버깅 도구 추가');
    }

    // 초기화
    function initialize() {
        console.log('⚡ 메모 즉시 삭제 시스템 초기화');
        
        // 확인 창 제거
        removeConfirmDialogs();
        
        // 잠금 시스템 업데이트
        updateLockSystem();
        
        // 모든 기존 확인창 제거
        removeAllExistingConfirms();
        
        // 시각적 피드백 추가
        addInstantDeleteVisualFeedback();
        
        // 애니메이션 적용
        applyInstantDeleteAnimation();
        
        // 디버깅 도구 추가
        addInstantDeleteDebugTools();
        
        // 상세 모달 삭제 버튼 업데이트 (지연 실행)
        setTimeout(() => {
            window.updateDetailModalDeleteButton();
        }, 1000);
        
        console.log('✅ 메모 즉시 삭제 시스템 초기화 완료');
        console.log('⚡ 이제 모든 메모가 확인 창 없이 즉시 삭제됩니다');
    }

    // DOM 로드 완료 후 초기화 (한 번만)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM이 이미 로드된 경우 한 번만 초기화
        initialize();
    }

})();