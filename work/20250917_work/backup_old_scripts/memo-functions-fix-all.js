// 메모 기능 통합 수정 - 잠금, 삭제, 편집, 알람 모두 복구

(function() {
    'use strict';
    
    console.log('🔧 메모 기능 통합 수정 시스템 시작');
    
    // 1. 잠금/해제 기능 수정 (비활성화 - HTML 기본 기능 사용)
    function fixLockFunctionality() {
        console.log('🔒 잠금 기능 수정 시작 - 스킵됨 (HTML 기본 기능 사용)');
        
        // HTML의 기본 잠금 기능을 사용하므로 여기서는 아무것도 하지 않음
        return;
        
        // 이하 코드는 비활성화됨
        const lockButtons = document.querySelectorAll('.memo-lock-toggle');
        console.log('⚠️ 잠금 버튼 오버라이드 비활성화 - HTML 기능 사용:', lockButtons.length);
    }
    
    // 2. 삭제 기능 수정
    function fixDeleteFunctionality() {
        console.log('🗑️ 삭제 기능 수정 시작');
        
        // 전역 삭제 함수 복구
        window.deleteMemo = function(id) {
            console.log('🗑️ 메모 삭제 시도:', id);
            
            // 메모 찾기
            let memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const memo = memos.find(m => m.id == id);
            
            if (!memo) {
                alert('삭제할 메모를 찾을 수 없습니다.');
                return;
            }
            
            // 잠금 확인
            const isDateMemo = memo.date === new Date().toISOString().split('T')[0];
            if (isDateMemo && !window.isDateMemosUnlocked) {
                alert('🔒 날짜별 메모가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                return;
            } else if (!isDateMemo && !window.isMemosUnlocked) {
                alert('🔒 메모가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                return;
            }
            
            // 삭제 확인
            if (confirm(`"${memo.title}" 메모를 삭제하시겠습니까?`)) {
                // 메모 삭제
                memos = memos.filter(m => m.id != id);
                localStorage.setItem('calendarMemos', JSON.stringify(memos));
                
                // 일정인 경우 스케줄도 삭제
                if (memo.isSchedule) {
                    let schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '[]');
                    schedules = schedules.filter(s => s.id != id);
                    localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
                }
                
                // UI 업데이트
                if (window.loadMemos) window.loadMemos();
                if (window.updateCalendarDisplay) window.updateCalendarDisplay();
                if (window.MemoSystem && window.MemoSystem.refresh) {
                    window.MemoSystem.refresh();
                }
                
                console.log('✅ 메모 삭제 완료:', memo.title);
            }
        };
        
        // 상세보기에서 삭제
        window.deleteMemoFromDetail = function() {
            console.log('🗑️ 상세보기에서 삭제 시도');
            
            if (!window.currentMemoId) {
                alert('삭제할 메모를 찾을 수 없습니다.');
                return;
            }
            
            window.deleteMemo(window.currentMemoId);
            
            // 모달 닫기
            if (window.closeMemoDetail) {
                window.closeMemoDetail();
            }
        };
    }
    
    // 3. 편집 기능 수정
    function fixEditFunctionality() {
        console.log('✏️ 편집 기능 수정 시작');
        
        window.editMemo = function() {
            console.log('✏️ 메모 편집 시작');
            
            if (!window.currentMemoId) {
                alert('편집할 메모를 찾을 수 없습니다.');
                return;
            }
            
            // 메모 찾기
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const memo = memos.find(m => m.id == window.currentMemoId);
            
            if (!memo) {
                alert('편집할 메모를 찾을 수 없습니다.');
                return;
            }
            
            // 잠금 확인
            const isDateMemo = memo.date === new Date().toISOString().split('T')[0];
            if (isDateMemo && !window.isDateMemosUnlocked) {
                alert('🔒 날짜별 메모가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                return;
            } else if (!isDateMemo && !window.isMemosUnlocked) {
                alert('🔒 메모가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                return;
            }
            
            // 편집 시 메모 리스트 숨기기
            hideAllMemoLists();
            
            // 편집 모달 생성
            createEditModal(memo);
        };
        
        function createEditModal(memo) {
            // 기존 모달 제거
            const existingModal = document.getElementById('editMemoModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 새 모달 생성
            const modal = document.createElement('div');
            modal.id = 'editMemoModal';
            modal.className = 'memo-modal';
            modal.style.display = 'block';
            
            modal.innerHTML = `
                <div class="memo-modal-content">
                    <div class="memo-modal-header">
                        <h2>📝 메모 편집</h2>
                        <button class="modal-close" onclick="document.getElementById('editMemoModal').remove(); restoreAllMemoLists();">✕</button>
                    </div>
                    <div class="memo-modal-body">
                        <input type="text" id="editTitle" class="memo-input" value="${memo.title}" placeholder="제목">
                        <textarea id="editContent" class="memo-textarea" placeholder="내용">${memo.content || ''}</textarea>
                        ${memo.isSchedule ? `
                            <div style="margin-top: 10px;">
                                <label>알람 시간:</label>
                                <input type="time" id="editTime" value="${memo.time || ''}" style="margin-left: 10px;">
                            </div>
                        ` : ''}
                        <div class="memo-modal-footer">
                            <button class="btn-primary" onclick="saveEditedMemo()">저장</button>
                            <button class="btn-secondary" onclick="document.getElementById('editMemoModal').remove(); restoreAllMemoLists();">취소</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 복원 함수를 전역으로 노출
            window.restoreAllMemoLists = restoreAllMemoLists;
            
            // 저장 함수
            window.saveEditedMemo = function() {
                const newTitle = document.getElementById('editTitle').value.trim();
                const newContent = document.getElementById('editContent').value.trim();
                const newTime = document.getElementById('editTime')?.value;
                
                if (!newTitle) {
                    alert('제목을 입력해주세요.');
                    return;
                }
                
                // 메모 업데이트
                let memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                const memoIndex = memos.findIndex(m => m.id == window.currentMemoId);
                
                if (memoIndex !== -1) {
                    memos[memoIndex].title = newTitle;
                    memos[memoIndex].content = newContent;
                    if (newTime && memo.isSchedule) {
                        memos[memoIndex].time = newTime;
                    }
                    
                    localStorage.setItem('calendarMemos', JSON.stringify(memos));
                    
                    // 일정인 경우 스케줄도 업데이트
                    if (memo.isSchedule) {
                        let schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '[]');
                        const scheduleIndex = schedules.findIndex(s => s.id == window.currentMemoId);
                        if (scheduleIndex !== -1) {
                            schedules[scheduleIndex].title = newTitle;
                            schedules[scheduleIndex].description = newContent;
                            if (newTime) {
                                schedules[scheduleIndex].time = newTime;
                            }
                            localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
                        }
                    }
                    
                    // UI 업데이트
                    if (window.loadMemos) window.loadMemos();
                    if (window.updateCalendarDisplay) window.updateCalendarDisplay();
                    if (window.MemoSystem && window.MemoSystem.refresh) {
                        window.MemoSystem.refresh();
                    }
                    
                    // 모달 닫기
                    document.getElementById('editMemoModal').remove();
                    restoreAllMemoLists(); // 메모 리스트 복원
                    if (window.closeMemoDetail) {
                        window.closeMemoDetail();
                    }
                    
                    console.log('✅ 메모 편집 완료');
                }
            };
        }
    }
    
    // 4. 알람 기능 수정
    function fixAlarmFunctionality() {
        console.log('⏰ 알람 기능 수정 시작');
        
        // 알람 체크박스 이벤트 복구
        const alarmCheckbox = document.getElementById('enableAlarm');
        if (alarmCheckbox) {
            alarmCheckbox.addEventListener('change', function() {
                const alarmSettings = document.getElementById('alarmSettings');
                if (alarmSettings) {
                    alarmSettings.style.display = this.checked ? 'block' : 'none';
                }
                console.log('⏰ 알람 설정:', this.checked ? '활성화' : '비활성화');
            });
        }
        
        // 날짜별 메모 알람 체크박스
        const dateMemoAlarm = document.getElementById('dateMemoAlarm');
        if (dateMemoAlarm) {
            dateMemoAlarm.addEventListener('change', function() {
                const alarmTimeDiv = document.getElementById('dateMemoAlarmTime');
                if (alarmTimeDiv) {
                    alarmTimeDiv.style.display = this.checked ? 'block' : 'none';
                }
                console.log('📅 날짜별 메모 알람:', this.checked ? '활성화' : '비활성화');
            });
        }
    }
    
    // 5. 편집 시 메모 리스트 숨기기/복원
    let hiddenElements = [];
    
    function hideAllMemoLists() {
        console.log('🙈 편집 모달 열림 - 모든 메모 리스트 숨기기');
        
        // body에 편집 중 클래스 추가
        document.body.classList.add('memo-editing');
        
        // 숨길 요소들 선택
        const selectorsToHide = [
            '#memoList',
            '#stickyMemoList',
            '.memo-list',
            '.memo-container',
            '[class*="memo-list"]',
            '[id*="memoList"]',
            'div[class*="memo"]:not(#editMemoModal):not([id*="Detail"]):not([id*="Modal"])',
            // 빈 메모 메시지도 숨기기
            'div:has-text("저장된 메모가 없습니다")',
            'div:has-text("이 날짜에 저장된 메모가 없습니다")'
        ];
        
        hiddenElements = [];
        
        selectorsToHide.forEach(selector => {
            try {
                let elements;
                if (selector.includes(':has-text')) {
                    // 텍스트 포함 요소 찾기
                    const text = selector.match(/"([^"]+)"/)[1];
                    elements = Array.from(document.querySelectorAll('div')).filter(el => 
                        el.textContent.includes(text) && 
                        !el.closest('#editMemoModal') &&
                        !el.closest('#memoDetailModal')
                    );
                } else {
                    elements = document.querySelectorAll(selector);
                }
                
                elements.forEach(element => {
                    // 편집 모달과 상세 모달은 제외
                    if (element.id && (element.id.includes('edit') || element.id.includes('Detail') || element.id.includes('Modal'))) {
                        return;
                    }
                    
                    if (element.style.display !== 'none') {
                        hiddenElements.push({
                            element: element,
                            originalDisplay: element.style.display || ''
                        });
                        element.style.display = 'none';
                    }
                });
            } catch (error) {
                // 셀렉터 오류 무시
            }
        });
        
        console.log(`🙈 ${hiddenElements.length}개 요소 숨김 완료`);
    }
    
    function restoreAllMemoLists() {
        console.log('👁️ 편집 완료 - 메모 리스트 복원');
        
        // body에서 편집 중 클래스 제거
        document.body.classList.remove('memo-editing');
        
        // 숨긴 요소들 복원
        hiddenElements.forEach(item => {
            if (item.element && document.body.contains(item.element)) {
                item.element.style.display = item.originalDisplay;
            }
        });
        
        hiddenElements = [];
        console.log('👁️ 모든 요소 복원 완료');
    }
    
    // 6. 메모 리스트 UI 업데이트
    function updateMemoListUI() {
        console.log('🔄 메모 리스트 UI 업데이트');
        
        // 메모 리스트 다시 로드
        if (window.loadMemos) {
            window.loadMemos();
        }
        
        // 통합 시스템 새로고침
        if (window.MemoSystem && window.MemoSystem.refresh) {
            window.MemoSystem.refresh();
        }
        
        // 날짜별 메모 업데이트
        if (window.displayDateMemos) {
            const selectedDate = window.selectedDate || new Date().toISOString().split('T')[0];
            window.displayDateMemos(selectedDate);
        }
    }
    
    // 6. 이벤트 리스너 재등록
    function reattachEventListeners() {
        console.log('🔗 이벤트 리스너 재등록');
        
        // 편집 버튼
        const editBtn = document.getElementById('editMemoBtn');
        if (editBtn) {
            editBtn.onclick = function(e) {
                e.preventDefault();
                window.editMemo();
            };
        }
        
        // 삭제 버튼
        const deleteBtn = document.getElementById('deleteMemoBtn');
        if (deleteBtn) {
            deleteBtn.onclick = function(e) {
                e.preventDefault();
                window.deleteMemoFromDetail();
            };
        }
        
        // 잠금 토글 버튼들
        setTimeout(() => {
            fixLockFunctionality();
        }, 500);
    }
    
    // 초기화 함수
    function initialize() {
        console.log('🚀 메모 기능 통합 수정 시작');
        
        // 각 기능 수정
        fixLockFunctionality();
        fixDeleteFunctionality();
        fixEditFunctionality();
        fixAlarmFunctionality();
        reattachEventListeners();
        
        // DOM 변경 감지 및 자동 복구
        const observer = new MutationObserver(() => {
            const editBtn = document.getElementById('editMemoBtn');
            const deleteBtn = document.getElementById('deleteMemoBtn');
            
            if (editBtn && !editBtn.onclick) {
                editBtn.onclick = function(e) {
                    e.preventDefault();
                    window.editMemo();
                };
            }
            
            if (deleteBtn && !deleteBtn.onclick) {
                deleteBtn.onclick = function(e) {
                    e.preventDefault();
                    window.deleteMemoFromDetail();
                };
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ 메모 기능 통합 수정 완료');
        console.log('📊 현재 상태:');
        console.log('- 일반 메모 잠금:', window.isMemosUnlocked ? '해제' : '잠김');
        console.log('- 날짜별 메모 잠금:', window.isDateMemosUnlocked ? '해제' : '잠김');
        console.log('- 편집 기능: 활성화');
        console.log('- 삭제 기능: 활성화');
        console.log('- 알람 기능: 활성화');
    }
    
    // 페이지 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();