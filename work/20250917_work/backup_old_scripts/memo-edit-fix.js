// 메모 편집 기능 수정 - 안정적인 편집 시스템

(function() {
    'use strict';

    console.log('📝 메모 편집 수정 시스템 로드됨');

    // 원본 editMemo 함수를 백업하고 새로운 함수로 대체
    if (typeof window.editMemo === 'function') {
        window.originalEditMemo = window.editMemo;
    }

    // 새로운 메모 편집 함수
    window.editMemo = function() {
        console.log('📝 새로운 editMemo 호출됨, currentMemoId:', window.currentMemoId);
        
        // currentMemoId가 없으면 대체 방법으로 ID 찾기
        let memoId = window.currentMemoId;
        
        if (!memoId) {
            // 메모 상세 모달에서 데이터 속성으로 ID 찾기
            const detailModal = document.getElementById('memoDetailModal');
            if (detailModal && detailModal.style.display !== 'none') {
                const titleElement = document.getElementById('memoDetailTitle');
                if (titleElement) {
                    // 제목으로 메모 찾기
                    const title = titleElement.textContent;
                    const allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                    const foundMemo = allMemos.find(m => m.title === title);
                    if (foundMemo) {
                        memoId = foundMemo.id;
                        console.log('🔍 제목으로 메모 ID 찾음:', memoId);
                    }
                }
            }
        }
        
        if (!memoId) {
            console.error('❌ currentMemoId가 없습니다');
            alert('편집할 메모를 찾을 수 없습니다.');
            return;
        }

        // 최신 메모 데이터 로드
        let allMemos = [];
        try {
            const storedMemos = localStorage.getItem('calendarMemos');
            if (storedMemos) {
                allMemos = JSON.parse(storedMemos);
            }
        } catch (error) {
            console.error('❌ 메모 데이터 로드 실패:', error);
            alert('메모 데이터를 불러올 수 없습니다.');
            return;
        }

        // 편집할 메모 찾기
        const memo = allMemos.find(m => m.id == memoId);
        if (!memo) {
            console.error('❌ 메모를 찾을 수 없음:', memoId);
            alert('편집할 메모를 찾을 수 없습니다.');
            return;
        }

        console.log('📝 편집할 메모:', memo);

        // 편집 데이터 준비
        let editTitle = memo.title;
        let editContent = memo.content;
        let editDate = memo.date;

        // 일정 메모의 경우 데이터 정리
        if (memo.isSchedule && memo.scheduleData) {
            // 제목에서 📅 아이콘 제거
            if (editTitle.startsWith('📅 ')) {
                editTitle = editTitle.substring(2);
            }
            
            // content에서 원본 설명 추출
            editContent = memo.scheduleData.description || '일정';
            
            console.log('📅 일정 메모 편집 데이터:', {
                원본제목: memo.title,
                편집제목: editTitle,
                원본내용: memo.content,
                편집내용: editContent,
                scheduleData: memo.scheduleData
            });
        } else if (editContent.includes('⏰') && editContent.includes(' | ')) {
            // 일반 메모에서 시간 정보 제거
            const parts = editContent.split(' | ');
            if (parts.length > 1) {
                editContent = parts.slice(1).join(' | ');
            }
        }

        // 편집 모달 생성 및 표시
        showEditModal(memo, editTitle, editContent, editDate);
    };

    function showEditModal(originalMemo, title, content, date) {
        // 기존 편집 모달이 있으면 제거
        const existingModal = document.getElementById('editMemoModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 편집 모달 생성
        const editModal = document.createElement('div');
        editModal.id = 'editMemoModal';
        editModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #333;">📝 메모 편집</h2>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    ${originalMemo.isSchedule ? '일정' : '메모'}를 수정하세요
                </p>
            </div>

            <form id="editMemoForm" onsubmit="return false;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        ${originalMemo.isSchedule ? '일정 제목' : '메모 제목'}
                    </label>
                    <input type="text" id="editMemoTitle" value="${title}" required
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        ${originalMemo.isSchedule ? '일정 내용' : '메모 내용'}
                    </label>
                    <textarea id="editMemoContent" required
                              style="width: 100%; min-height: 120px; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical;">${content}</textarea>
                </div>

                ${originalMemo.isSchedule && originalMemo.scheduleData ? `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
                    <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 14px;">📅 일정 정보</h4>
                    <p style="margin: 5px 0; font-size: 14px;">⏰ 시간: ${originalMemo.scheduleData.time}</p>
                    ${originalMemo.scheduleData.alarm?.enabled ? 
                        `<p style="margin: 5px 0; font-size: 14px;">🔔 알람: ${originalMemo.scheduleData.alarm.minutesBefore === 0 ? '바로 알림' : originalMemo.scheduleData.alarm.minutesBefore + '분 전'}</p>` 
                        : ''
                    }
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                        ⚠️ 시간과 알람 설정은 일정 편집에서 변경할 수 있습니다.
                    </p>
                </div>
                ` : ''}

                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
                    <button type="button" id="saveEditMemo" 
                            style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; min-width: 120px;">
                        💾 저장
                    </button>
                    <button type="button" id="deleteEditMemo" 
                            style="padding: 12px 24px; background: #dc3545; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; min-width: 120px;">
                        🗑️ 삭제
                    </button>
                    <button type="button" id="cancelEditMemo" 
                            style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; min-width: 120px;">
                        ❌ 취소
                    </button>
                </div>
            </form>
        `;

        editModal.appendChild(modalContent);
        document.body.appendChild(editModal);

        // 편집 모달이 열릴 때 불필요한 메모 리스트 숨기기
        hideUnnecessaryElements();
        
        // CSS를 통한 추가 숨김 처리
        document.body.classList.add('memo-editing');

        // 이벤트 리스너 추가
        document.getElementById('saveEditMemo').addEventListener('click', () => {
            saveEditedMemo(originalMemo);
        });

        document.getElementById('deleteEditMemo').addEventListener('click', () => {
            deleteFromEditModal(originalMemo, editModal);
        });

        document.getElementById('cancelEditMemo').addEventListener('click', () => {
            restoreHiddenElements();
            editModal.remove();
        });

        // ESC 키로 닫기
        editModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                restoreHiddenElements();
                editModal.remove();
            }
        });

        // 배경 클릭으로 닫기
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                restoreHiddenElements();
                editModal.remove();
            }
        });

        // 제목 입력창에 포커스
        document.getElementById('editMemoTitle').focus();
    }

    function saveEditedMemo(originalMemo) {
        const newTitle = document.getElementById('editMemoTitle').value.trim();
        const newContent = document.getElementById('editMemoContent').value.trim();

        if (!newTitle) {
            alert('제목을 입력해주세요!');
            return;
        }

        console.log('💾 메모 저장 중:', { 원본ID: originalMemo.id, 새제목: newTitle, 새내용: newContent });

        try {
            // 최신 메모 데이터 로드
            let allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            
            // 해당 메모 찾아서 수정
            const memoIndex = allMemos.findIndex(m => m.id == originalMemo.id);
            
            if (memoIndex === -1) {
                alert('수정할 메모를 찾을 수 없습니다.');
                return;
            }

            const updatedMemo = { ...allMemos[memoIndex] };

            // 일정 메모인 경우
            if (originalMemo.isSchedule && originalMemo.scheduleData) {
                // 제목 업데이트 (📅 아이콘 포함)
                updatedMemo.title = `📅 ${newTitle}`;
                
                // content 업데이트 (시간 + 내용)
                const scheduleData = updatedMemo.scheduleData;
                updatedMemo.content = `⏰ ${scheduleData.time}${scheduleData.alarm?.enabled ? ' 🔔' : ''} | ${newContent}`;
                
                // scheduleData의 title과 description 업데이트
                scheduleData.title = newTitle;
                scheduleData.description = newContent;
                
                // 스케줄 데이터도 업데이트
                let schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '[]');
                const scheduleIndex = schedules.findIndex(s => s.id == originalMemo.id);
                if (scheduleIndex !== -1) {
                    schedules[scheduleIndex].title = newTitle;
                    schedules[scheduleIndex].description = newContent;
                    localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
                }
                
                console.log('📅 일정 메모 업데이트:', updatedMemo);
            } else {
                // 일반 메모인 경우
                updatedMemo.title = newTitle;
                updatedMemo.content = newContent;
                
                console.log('📝 일반 메모 업데이트:', updatedMemo);
            }

            // 수정 시간 업데이트
            updatedMemo.lastModified = new Date().toISOString();

            // 배열에서 업데이트
            allMemos[memoIndex] = updatedMemo;

            // 저장
            localStorage.setItem('calendarMemos', JSON.stringify(allMemos));

            // 전역 변수 동기화
            if (window.memos) window.memos = allMemos;
            if (window.allMemos) window.allMemos = allMemos;

            // UI 새로고침
            if (window.MemoSystem && window.MemoSystem.refresh) {
                window.MemoSystem.refresh();
            } else {
                // 폴백: 기본 새로고침
                if (window.loadMemos) window.loadMemos();
                if (window.updateCalendarDisplay) window.updateCalendarDisplay();
            }

            // 편집 모달 닫기
            restoreHiddenElements();
            document.getElementById('editMemoModal').remove();

            // 상세보기 모달 닫기
            if (window.closeMemoDetail) {
                window.closeMemoDetail();
            }

            // 성공 메시지
            console.log('✅ 메모 편집 완료');
            
            // 잠시 성공 알림 표시
            showSuccessMessage('📝 메모가 수정되었습니다!');

        } catch (error) {
            console.error('❌ 메모 저장 실패:', error);
            alert('메모 저장 중 오류가 발생했습니다: ' + error.message);
        }
    }

    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000000;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;

        // CSS 애니메이션 추가
        if (!document.getElementById('editSuccessAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'editSuccessAnimationStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        // 3초 후 제거
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                successDiv.remove();
            }
        }, 3000);
    }

    // 초기화 함수
    function initialize() {
        console.log('📝 메모 편집 수정 시스템 초기화 완료');
        
        // 기존 편집 모달이 있으면 제거
        const existingModal = document.getElementById('editMemoModal');
        if (existingModal) {
            existingModal.remove();
        }
    }

    // 편집 모달 열릴 때 불필요한 요소들 숨기기
    function hideUnnecessaryElements() {
        const elementsToHide = [
            '#memoList',
            '#stickyMemoList',
            '.memo-list',
            '.memo-container',
            '.calendar-container .memo-item',
            '[class*="memo-list"]',
            '[class*="memo-container"]',
            '[id*="memoList"]',
            '[id*="memo-list"]',
            // 달력 밑 메모 영역들 추가
            '.calendar-memo-section',
            '.bottom-memo-list',
            '.below-calendar-memos',
            '#calendarMemoList',
            '#bottomMemoList',
            // 더 포괄적인 메모 관련 요소들
            'div[class*="memo"]:not(#editMemoModal):not([id*="Detail"]):not([id*="edit"])',
            'ul[class*="memo"]',
            'section[class*="memo"]'
        ];

        window.hiddenElements = [];

        elementsToHide.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // 편집 모달과 상세 모달은 숨기지 않음
                    if (element.id && (element.id.includes('edit') || element.id.includes('Detail') || element.id.includes('Modal'))) {
                        return;
                    }
                    
                    if (element.style.display !== 'none') {
                        window.hiddenElements.push({
                            element: element,
                            originalDisplay: element.style.display || 'block'
                        });
                        element.style.display = 'none';
                    }
                });
            } catch (error) {
                console.warn('셀렉터 처리 중 오류:', selector, error);
            }
        });

        // "저장된 메모가 없습니다" 메시지들도 숨기기
        hideEmptyMessages();
        
        console.log('🙈 편집 모달 열림 - 불필요한 요소들 숨김:', window.hiddenElements.length);
    }

    // "저장된 메모가 없습니다" 메시지 숨기기
    function hideEmptyMessages() {
        const emptyMessages = [
            '저장된 메모가 없습니다',
            '이 날짜에 저장된 메모가 없습니다'
        ];
        
        emptyMessages.forEach(message => {
            const elements = document.querySelectorAll('div');
            elements.forEach(element => {
                if (element.textContent.includes(message) && 
                    !element.closest('#editMemoModal') && 
                    !element.closest('#memoDetailModal')) {
                    
                    window.hiddenElements.push({
                        element: element,
                        originalDisplay: element.style.display || 'block'
                    });
                    element.style.display = 'none';
                }
            });
        });
    }

    // 편집 모달 닫힐 때 숨긴 요소들 복원
    function restoreHiddenElements() {
        if (window.hiddenElements && window.hiddenElements.length > 0) {
            window.hiddenElements.forEach(item => {
                if (item.element && document.body.contains(item.element)) {
                    item.element.style.display = item.originalDisplay;
                }
            });
            console.log('👁️ 편집 모달 닫힌 후 요소들 복원:', window.hiddenElements.length);
            window.hiddenElements = [];
        }
        
        // CSS 클래스 제거
        document.body.classList.remove('memo-editing');
    }

    // 편집 모달에서 삭제 처리
    function deleteFromEditModal(originalMemo, editModal) {
        // 삭제 확인
        const confirmMessage = `"${originalMemo.title}"${originalMemo.isSchedule ? ' 일정' : ' 메모'}을 삭제하시겠습니까?\n\n⚠️ 삭제된 후에는 복구할 수 없습니다.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        console.log('🗑️ 편집 모달에서 삭제 요청:', originalMemo.id);

        try {
            // 최신 메모 데이터 로드
            let allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            
            // 해당 메모 찾아서 삭제
            const memoIndex = allMemos.findIndex(m => m.id == originalMemo.id);
            
            if (memoIndex === -1) {
                alert('삭제할 메모를 찾을 수 없습니다.');
                return;
            }

            // 메모 배열에서 제거
            const deletedMemo = allMemos.splice(memoIndex, 1)[0];
            console.log('🗑️ 메모 삭제됨:', deletedMemo.title);

            // 일정 메모인 경우 스케줄도 삭제
            if (originalMemo.isSchedule) {
                let schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '[]');
                const scheduleIndex = schedules.findIndex(s => s.id == originalMemo.id);
                if (scheduleIndex !== -1) {
                    schedules.splice(scheduleIndex, 1);
                    localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
                    console.log('📅 연관된 스케줄도 삭제됨');
                }

                // 활성 알람도 삭제
                if (window.activeAlarms && window.activeAlarms.has(originalMemo.id)) {
                    clearTimeout(window.activeAlarms.get(originalMemo.id));
                    window.activeAlarms.delete(originalMemo.id);
                    console.log('🔔 연관된 알람도 삭제됨');
                }
            }

            // localStorage에 저장
            localStorage.setItem('calendarMemos', JSON.stringify(allMemos));

            // 전역 변수 동기화
            if (window.memos) window.memos = allMemos;
            if (window.allMemos) window.allMemos = allMemos;

            // UI 새로고침
            if (window.MemoSystem && window.MemoSystem.refresh) {
                window.MemoSystem.refresh();
            } else {
                // 폴백: 기본 새로고침
                if (window.loadMemos) window.loadMemos();
                if (window.updateCalendarDisplay) window.updateCalendarDisplay();
            }

            // 편집 모달 닫기
            restoreHiddenElements();
            editModal.remove();

            // 상세보기 모달도 닫기 (이미 삭제된 메모이므로)
            if (window.closeMemoDetail) {
                window.closeMemoDetail();
            }

            // 성공 메시지
            console.log('✅ 편집 모달에서 메모 삭제 완료');
            showSuccessMessage(`🗑️ "${deletedMemo.title}" ${originalMemo.isSchedule ? '일정이' : '메모가'} 삭제되었습니다!`);

        } catch (error) {
            console.error('❌ 편집 모달에서 메모 삭제 실패:', error);
            alert('메모 삭제 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // 페이지 로드 후 초기화
    setTimeout(initialize, 1000);

})();