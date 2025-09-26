/**
 * 강제 메모창 열기 시스템
 * unified 시스템과 완전히 독립적으로 작동
 */

(function() {
    'use strict';
    
    console.log('🔥 강제 메모창 열기 시스템 시작');
    
    // 모달 열기 차단만 해제 (메모 잠금은 건드리지 않음)
    function clearModalBlocks() {
        window._preventAutoOpenDateModal = false;
        window.preventDateMemoAutoOpen = false;
        window.memoSystemInitializing = false;
        
        if (window.MemoSystem) {
            window.MemoSystem.isInitializing = false;
        }
    }
    
    // 직접 모달 열기 함수 (unified 시스템 완전 우회)
    function forceOpenDateModal(year, month, date) {
        console.log(`🔥 강제 메모창 열기: ${year}-${month}-${date}`);
        
        // 모달 열기 차단만 해제 (메모 잠금은 건드리지 않음)
        clearModalBlocks();
        
        const modal = document.getElementById('dateMemoModal');
        if (!modal) {
            console.error('❌ 메모 모달을 찾을 수 없습니다');
            return;
        }
        
        // 날짜 설정
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        window.selectedDate = dateStr;
        
        // 모달 제목 업데이트
        const titleElement = document.getElementById('dateMemoTitle');
        if (titleElement) {
            titleElement.textContent = `📅 ${year}년 ${month}월 ${date}일 메모`;
        }
        
        // 입력 필드 초기화
        const titleInput = document.getElementById('dateMemoTitleInput');
        const contentInput = document.getElementById('dateMemoContentInput');
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        
        // 모달 열기 시 즉시 위치 고정 및 메모 표시
        forceShowMemos(); // 즉시 실행
        
        // unified 시스템의 UI 새로고침 호출 및 무조건 메모 표시
        setTimeout(() => {
            if (window.MemoSystem && typeof window.MemoSystem.refreshUI === 'function') {
                window.MemoSystem.refreshUI();
            }
            forceShowMemos(); // 다시 실행
        }, 50);
        
        setTimeout(() => {
            forceShowMemos(); // 추가 보장
        }, 150);
        
        setTimeout(() => {
            forceShowMemos(); // 한 번 더 보장
        }, 300);
        
        // 기존 메모 로드 (백업)
        loadDateMemos(dateStr);
        
        // 모달을 항상 화면 중앙에 위치시키기 (달력 기준)
        modal.style.position = 'fixed';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '600px';
        modal.style.maxWidth = '90vw';
        modal.style.maxHeight = '90vh';
        modal.style.overflow = 'auto';
        
        // 모달 컨텐츠도 중앙 정렬
        const modalContent = modal.querySelector('.memo-modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.margin = '0';
            modalContent.style.transform = 'none';
            modalContent.style.left = '';
            modalContent.style.top = '';
        }
        
        // 모달 강제 표시 (배경색 정상화)
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '10000';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.color = '';  // 텍스트 색상 초기화
        modal.style.border = '';  // 테두리 초기화
        
        // 포커스 설정
        setTimeout(() => {
            if (titleInput) {
                titleInput.focus();
            }
        }, 100);
        
    }
    
    // 모달 위치 완전 고정 및 메모 절대 강제 표시
    function forceShowMemos() {
        try {
            const modal = document.getElementById('dateMemoModal');
            if (!modal) {
                return;
            }
            
            // 모달 위치 절대 고정
            modal.style.setProperty('position', 'fixed', 'important');
            modal.style.setProperty('left', '50%', 'important');
            modal.style.setProperty('top', '50%', 'important');
            modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            modal.style.setProperty('width', '600px', 'important');
            modal.style.setProperty('max-width', '90vw', 'important');
            modal.style.setProperty('max-height', '90vh', 'important');
            modal.style.setProperty('overflow', 'auto', 'important');
            modal.style.setProperty('z-index', '10000', 'important');
            
            // 모달이 닫혀있어도 위치는 고정
            if (modal.style.display === 'none') {
                return; // 표시 작업은 하지 않고 위치만 고정
            }
            
            // 메모 관련 요소들만 선별적 강제 표시 (UI 보존)
            const memoElements = modal.querySelectorAll('.memo-item, .memo-list, .memo-container, .saved-memos');
            memoElements.forEach(element => {
                element.style.setProperty('display', 'block', 'important');
                element.style.setProperty('visibility', 'visible', 'important');
                element.style.setProperty('opacity', '1', 'important');
                element.style.setProperty('height', 'auto', 'important');
                element.style.setProperty('width', 'auto', 'important');
                element.style.setProperty('max-height', 'none', 'important');
                element.style.setProperty('max-width', 'none', 'important');
                element.style.setProperty('overflow', 'visible', 'important');
                element.style.setProperty('position', 'static', 'important');
                element.style.setProperty('left', 'auto', 'important');
                element.style.setProperty('top', 'auto', 'important');
                element.style.setProperty('clip', 'auto', 'important');
                element.style.setProperty('clip-path', 'none', 'important');
                element.removeAttribute('hidden');
                element.classList.remove('hidden', 'd-none', 'locked');
            });
            
            // 메모 요소 내부의 텍스트들도 표시
            const memoTexts = modal.querySelectorAll('.memo-item *, .memo-list *, .memo-container *, .saved-memos *');
            memoTexts.forEach(element => {
                element.style.setProperty('display', 'block', 'important');
                element.style.setProperty('visibility', 'visible', 'important');
                element.style.setProperty('opacity', '1', 'important');
                element.removeAttribute('hidden');
                element.classList.remove('hidden', 'd-none', 'locked');
            });
            
            
        } catch (error) {
            console.error('❌ 메모 표시 실패:', error);
        }
    }
    
    // 날짜별 메모 로드 함수
    function loadDateMemos(dateStr) {
        try {
            const memos = JSON.parse(localStorage.getItem('memos') || '[]');
            const dateMemos = memos.filter(memo => memo.date === dateStr);
            
            const memoList = document.querySelector('#dateMemoModal .memo-list');
            if (!memoList) {
                console.log('❌ memo-list 요소를 찾을 수 없음');
                return;
            }
            
            if (dateMemos.length === 0) {
                memoList.innerHTML = '<div class="empty-memo" style="padding: 20px; text-align: center; color: #666;">이 날짜에는 메모가 없습니다.</div>';
                return;
            }
            
            const memoHtml = dateMemos.map(memo => `
                <div class="memo-item" data-memo-id="${memo.id}" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; background: #f9f9f9;">
                    <div class="memo-item-title" style="font-weight: bold; font-size: 16px; color: #333; margin-bottom: 8px;">${memo.title}</div>
                    <div class="memo-item-content" style="color: #666; margin-bottom: 8px;">${memo.content || ''}</div>
                    <div class="memo-item-time" style="font-size: 12px; color: #999;">${new Date(memo.timestamp).toLocaleString()}</div>
                </div>
            `).join('');
            
            memoList.innerHTML = memoHtml;
            
            // unified 시스템 UI 새로고침도 호출
            setTimeout(() => {
                if (window.MemoSystem && typeof window.MemoSystem.refreshUI === 'function') {
                    window.MemoSystem.refreshUI();
                }
            }, 100);
        } catch (error) {
            console.error('❌ 메모 로드 실패:', error);
        }
    }
    
    // 메모 저장 함수 (강제)
    function forceSaveMemo() {
        const titleInput = document.getElementById('dateMemoTitleInput');
        const contentInput = document.getElementById('dateMemoContentInput');
        
        if (!titleInput || !contentInput || !window.selectedDate) {
            console.log('❌ 메모 저장 실패: 필수 요소 누락');
            return;
        }
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title) {
            alert('메모 제목을 입력해주세요!');
            titleInput.focus();
            return;
        }
        
        try {
            const memos = JSON.parse(localStorage.getItem('memos') || '[]');
            const newMemo = {
                id: Date.now(),
                title: title,
                content: content,
                date: window.selectedDate,
                timestamp: new Date().toISOString()
            };
            
            memos.push(newMemo);
            localStorage.setItem('memos', JSON.stringify(memos));
            
            // 입력 필드 초기화
            titleInput.value = '';
            contentInput.value = '';
            
            // 메모 리스트 즉시 새로고침
            loadDateMemos(window.selectedDate);
            
            // unified 시스템 UI 새로고침 및 무조건 메모 표시
            setTimeout(() => {
                if (window.MemoSystem && typeof window.MemoSystem.refreshUI === 'function') {
                    window.MemoSystem.refreshUI();
                    console.log('📋 메모 저장 후 unified 시스템 UI 새로고침');
                }
                forceShowMemos(); // 잠금 상태와 관계없이 무조건 표시
            }, 50);
            
            setTimeout(() => {
                if (window.MemoSystem && typeof window.MemoSystem.refreshUI === 'function') {
                    window.MemoSystem.refreshUI();
                }
                forceShowMemos(); // 추가 보장
            }, 200);
            
        } catch (error) {
            console.error('❌ 메모 저장 실패:', error);
            alert('메모 저장에 실패했습니다.');
        }
    }
    
    // 강제 날짜 클릭 이벤트 핸들러 (모든 이벤트를 가로채기)
    function handleDateClick(event) {
        const target = event.target;
        
        // 달력 날짜 셀 확인 - 더 광범위하게
        if (target.closest('.calendar-grid') && target.textContent.trim().match(/^\d+$/)) {
            const dateText = target.textContent.trim();
            const dateNum = parseInt(dateText);
            
            if (dateNum && dateNum >= 1 && dateNum <= 31) {
                // 현재 년월 가져오기
                const year = window.currentYear || 2025;
                const month = (window.currentMonth !== undefined ? window.currentMonth + 1 : 8);
                
                // 모든 이벤트 완전 차단
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
                
                // 모든 이벤트 완전 차단하여 메모창 열기
                
                // 즉시 강제 메모창 열기
                forceOpenDateModal(year, month, dateNum);
                
                return false;
            }
        }
    }
    
    // 기존 함수들 완전 교체
    function hijackFunctions() {
        // openDateMemoModal 함수 교체
        if (window.openDateMemoModal && !window._originalOpenDateMemoModal) {
            window._originalOpenDateMemoModal = window.openDateMemoModal;
        }
        window.openDateMemoModal = function(year, month, date) {
            // 전역 모달 상태 확인
            if (isModalOpen) {
                console.log('🚫 메모창이 이미 열려있어 날짜 전환 완전 차단');
                return;
            }
            
            // 추가 검증
            const modal = document.getElementById('dateMemoModal');
            if (modal && modal.style.display === 'block') {
                console.log('🚫 메모창이 이미 열려있어 날짜 전환 완전 차단');
                isModalOpen = true;
                return;
            }
            
            isModalOpen = true;
            forceOpenDateModal(year, month, date);
        };
        
        // closeDateMemoModal 함수 교체 (자동 잠금 포함 + 위치 유지)
        if (window.closeDateMemoModal && !window._originalCloseDateMemoModal) {
            window._originalCloseDateMemoModal = window.closeDateMemoModal;
        }
        window.closeDateMemoModal = function() {
            const modal = document.getElementById('dateMemoModal');
            
            // 모달 닫기 전에 위치 고정
            if (modal) {
                modal.style.position = 'fixed';
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.width = '600px';
                modal.style.maxWidth = '90vw';
                modal.style.maxHeight = '90vh';
                modal.style.overflow = 'auto';
            }
            
            // 기존 HTML 함수 실행 (기본 동작 유지)
            if (window._originalCloseDateMemoModal) {
                window._originalCloseDateMemoModal();
            }
            
            // 닫은 후에도 위치 유지 확보
            setTimeout(() => {
                if (modal) {
                    modal.style.position = 'fixed';
                    modal.style.left = '50%';
                    modal.style.top = '50%';
                    modal.style.transform = 'translate(-50%, -50%)';
                    modal.style.width = '600px';
                    modal.style.maxWidth = '90vw';
                    modal.style.maxHeight = '90vh';
                    modal.style.overflow = 'auto';
                }
                autoLockAfterClose();
            }, 10);
        };
    }
    
    // 모달 닫은 후 자동 잠금 함수
    function autoLockAfterClose() {
        try {
            // 1. 잠금 토글 버튼 상태를 잠금으로 변경
            const lockToggle = document.getElementById('dateMemoLockToggle');
            if (lockToggle) {
                const lockIcon = lockToggle.querySelector('.lock-icon');
                const lockText = lockToggle.querySelector('.lock-text');
                
                if (lockIcon) {
                    // 잠금 상태로 변경
                    lockIcon.textContent = '🔒';
                    if (lockText) {
                        lockText.textContent = '잠금';
                    }
                }
            }
            
            // 2. localStorage에 잠금 상태 저장
            if (window.selectedDate) {
                localStorage.setItem('dateMemos_locked_' + window.selectedDate, 'true');
                localStorage.removeItem('dateMemos_unlocked');
            }
            
            // 전역 잠금 상태 설정
            localStorage.setItem('alwaysShowMemos', 'false');
            
            // 3. 전역 변수를 잠금 상태로 설정
            window.isDateMemosLocked = true;
            window.dateMemosLocked = true;
            window.alwaysShowMemos = false;
            
            // 4. unified 시스템 잠금 설정
            if (window.MemoSystem) {
                window.MemoSystem.isDateMemosLocked = true;
                if (window.MemoSystem.dateMemos) {
                    window.MemoSystem.dateMemos.locked = true;
                }
            }
            
        } catch (error) {
            console.error('❌ 자동 잠금 설정 실패:', error);
        }
    }
    
    // 모달 닫기 함수 (자동 잠금 포함, 위치는 유지)
    function forceCloseModal() {
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            // 전역 모달 상태 업데이트
            isModalOpen = false;
            
            // 모달 닫기 전에 자동 잠금 설정
            autoLockAfterClose();
            
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            
            // 위치 스타일은 중앙 고정으로 유지 (초기화하지 않음)
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.width = '600px';
            modal.style.maxWidth = '90vw';
            modal.style.maxHeight = '90vh';
            modal.style.overflow = 'auto';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            
            // 모달 컨텐츠 스타일도 중앙으로 유지
            const modalContent = modal.querySelector('.memo-modal-content');
            if (modalContent) {
                modalContent.style.position = 'relative';
                modalContent.style.margin = '0';
                modalContent.style.transform = 'none';
                modalContent.style.left = '';
                modalContent.style.top = '';
            }
            
            // 입력 필드 초기화
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            
            window.selectedDate = null;
        }
    }
    
    // 전역 모달 상태 추적
    let isModalOpen = false;
    
    // 초기화 함수
    function initialize() {
        console.log('🔥 강제 메모창 시스템 초기화');
        
        // 모달 상태 초기화
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            isModalOpen = modal.style.display === 'block';
        }
        
        // 모달 열기 차단만 임시 해제 (메모 잠금은 건드리지 않음)
        clearModalBlocks();
        
        // 함수들 하이재킹
        hijackFunctions();
        
        // 초기화 시점에서도 위치 고정 및 메모 표시 강제 실행
        forceShowMemos();
        
        // 날짜 클릭 이벤트 캡처 차단
        document.addEventListener('click', function(e) {
            // 메모창이 열려있고 달력 날짜를 클릭한 경우
            if (isModalOpen) {
                const target = e.target;
                if (target.classList.contains('date-cell') || 
                    target.closest('.date-cell') ||
                    target.classList.contains('day') ||
                    target.closest('.day')) {
                    console.log('🚫 메모창 열림 중 날짜 클릭 완전 차단');
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                }
            }
        }, true); // 캡처 단계에서 처리
        
        // 주기적으로 강제 위치 고정 및 메모 표시 (매우 자주)
        setInterval(() => {
            hijackFunctions();
            forceShowMemos(); // 항상 실행 (모달이 닫혀있어도 위치는 고정)
            
            // 모달 상태 동기화
            const modal = document.getElementById('dateMemoModal');
            if (modal) {
                const currentState = modal.style.display === 'block';
                if (currentState !== isModalOpen) {
                    isModalOpen = currentState;
                    console.log(`📊 모달 상태 동기화: ${isModalOpen ? '열림' : '닫힘'}`);
                }
            }
            
            // 모달이 열려있으면 추가 처리
            if (modal && modal.style.display === 'block') {
                // unified 시스템 UI 새로고침
                if (window.MemoSystem && typeof window.MemoSystem.refreshUI === 'function') {
                    const hasVisibleMemos = modal.querySelectorAll('.memo-item').length > 0;
                    if (!hasVisibleMemos) {
                        window.MemoSystem.refreshUI();
                    }
                }
            }
            
            // 저장 버튼 재연결 확인
            const saveBtn = document.getElementById('saveDateMemo');
            if (saveBtn && !saveBtn._forceConnected) {
                saveBtn._forceConnected = true;
                saveBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    forceSaveMemo();
                });
            }
        }, 200);  // 200ms마다 강제 실행
        
        // 최고 우선순위로 날짜 클릭 이벤트 가로채기
        document.addEventListener('click', handleDateClick, true);
        
        // 추가적으로 버블링 단계에서도 가로채기
        document.addEventListener('click', handleDateClick, false);
        
        // 달력 컨테이너에 직접 이벤트 등록
        setTimeout(() => {
            const calendarGrid = document.querySelector('.calendar-grid');
            if (calendarGrid) {
                calendarGrid.addEventListener('click', handleDateClick, true);
            }
        }, 1000);
        
        // 메모 저장 버튼 이벤트 강제 연결
        setTimeout(() => {
            const saveBtn = document.getElementById('saveDateMemo');
            if (saveBtn) {
                // 기존 이벤트 제거
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                
                // 강제 저장 함수 연결
                newSaveBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    forceSaveMemo();
                });
                
                // 메모 저장 버튼 연결 완료
            }
        }, 1000);
        
        // Enter 키로 메모 저장
        document.addEventListener('keydown', function(e) {
            const modal = document.getElementById('dateMemoModal');
            if (modal && modal.style.display === 'block') {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    forceSaveMemo();
                } else if (e.key === 'Escape') {
                    forceCloseModal();
                }
            }
        });
        
        // 잠금 토글 버튼 클릭 감지 (잠금 상태와 관계없이 무조건 표시)
        document.addEventListener('click', function(e) {
            if (e.target.closest('#dateMemoLockToggle')) {
                setTimeout(() => {
                    const modal = document.getElementById('dateMemoModal');
                    if (modal && modal.style.display === 'block') {
                        // unified 시스템 UI 새로고침
                        if (window.MemoSystem && typeof window.MemoSystem.refreshUI === 'function') {
                            window.MemoSystem.refreshUI();
                        }
                        // 잠금 상태와 관계없이 메모 무조건 표시
                        setTimeout(() => {
                            forceShowMemos();
                        }, 50);
                        setTimeout(() => {
                            forceShowMemos();
                        }, 200);
                    }
                }, 10);
            }
        });
        
        // 전역 함수로 노출
        window.forceOpenDateModal = forceOpenDateModal;
        window.forceCloseModal = forceCloseModal;
        window.forceSaveMemo = forceSaveMemo;
        window.forceLoadDateMemos = loadDateMemos;
        window.forceShowMemos = forceShowMemos;
        
        // 강제 메모창 시스템 초기화 완료
    }
    
    // DOM 준비 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();