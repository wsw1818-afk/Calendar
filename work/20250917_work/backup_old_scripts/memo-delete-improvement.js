// 메모 삭제 개선 시스템 - 확인 후 삭제

(function() {
    'use strict';

    console.log('🗑️ 메모 삭제 개선 시스템 로드됨');

    // 원본 deleteMemoFromDetail 함수를 백업하고 개선된 버전으로 교체
    if (typeof window.deleteMemoFromDetail === 'function') {
        window.originalDeleteMemoFromDetail = window.deleteMemoFromDetail;
    }

    // 개선된 삭제 함수
    window.deleteMemoFromDetail = function() {
        console.log('🗑️ 개선된 deleteMemoFromDetail 호출됨');
        
        if (!window.currentMemoId) {
            // currentMemoId가 없으면 모달에서 ID 찾기 시도
            const detailModal = document.getElementById('memoDetailModal');
            if (detailModal) {
                const storedId = detailModal.getAttribute('data-memo-id');
                if (storedId) {
                    window.currentMemoId = parseInt(storedId);
                    console.log('🔍 모달에서 ID 복구:', window.currentMemoId);
                }
            }
        }

        if (!window.currentMemoId) {
            alert('삭제할 메모를 찾을 수 없습니다.');
            return;
        }

        // 최신 메모 데이터에서 메모 찾기
        let allMemos = [];
        try {
            allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        } catch (error) {
            console.error('메모 데이터 로드 실패:', error);
            alert('메모 데이터를 불러올 수 없습니다.');
            return;
        }

        const memo = allMemos.find(m => m.id == window.currentMemoId);
        if (!memo) {
            alert('삭제할 메모를 찾을 수 없습니다.');
            return;
        }

        // 잠금 상태 확인
        const isDateMemo = memo.date === new Date().toISOString().split('T')[0];
        if (isDateMemo && window.isDateMemosUnlocked === false) {
            alert('🔒 날짜별 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
            return;
        } else if (!isDateMemo && window.isMemosUnlocked === false) {
            alert('🔒 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
            return;
        }

        // 삭제 확인
        const confirmMessage = `"${memo.title}" ${memo.isSchedule ? '일정' : '메모'}을 삭제하시겠습니까?\n\n⚠️ 삭제 후에는 복구할 수 없습니다.`;
        
        if (!confirm(confirmMessage)) {
            console.log('🚫 사용자가 삭제를 취소했습니다');
            return;
        }

        console.log('🗑️ 삭제 확인 완료 - 메모 삭제 진행:', memo.title);

        try {
            // 메모 배열에서 제거
            const memoIndex = allMemos.findIndex(m => m.id == window.currentMemoId);
            if (memoIndex !== -1) {
                const deletedMemo = allMemos.splice(memoIndex, 1)[0];
                console.log('🗑️ 메모 삭제됨:', deletedMemo.title);

                // 일정 메모인 경우 스케줄도 삭제
                if (memo.isSchedule) {
                    let schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '[]');
                    const scheduleIndex = schedules.findIndex(s => s.id == window.currentMemoId);
                    if (scheduleIndex !== -1) {
                        schedules.splice(scheduleIndex, 1);
                        localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
                        console.log('📅 연관된 스케줄도 삭제됨');
                    }

                    // 활성 알람도 삭제
                    if (window.activeAlarms && window.activeAlarms.has(window.currentMemoId)) {
                        clearTimeout(window.activeAlarms.get(window.currentMemoId));
                        window.activeAlarms.delete(window.currentMemoId);
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

                // 상세보기 모달 닫기
                if (window.closeMemoDetail) {
                    window.closeMemoDetail();
                }

                // 성공 메시지 표시
                showDeleteSuccessMessage(`🗑️ "${deletedMemo.title}" ${memo.isSchedule ? '일정이' : '메모가'} 삭제되었습니다!`);

                console.log('✅ 메모 삭제 완료');

            } else {
                alert('삭제할 메모를 찾을 수 없습니다.');
            }

        } catch (error) {
            console.error('❌ 메모 삭제 실패:', error);
            alert('메모 삭제 중 오류가 발생했습니다: ' + error.message);
        }
    };

    // 삭제 성공 메시지 표시
    function showDeleteSuccessMessage(message) {
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

        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        // 3초 후 제거
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                successDiv.remove();
            }
        }, 3000);

        console.log('📢 삭제 성공 메시지 표시:', message);
    }

    // 즉시 삭제 시스템이 활성화되어 있다면 확인창을 강제로 활성화
    function ensureDeleteConfirmation() {
        // 즉시 삭제 시스템의 확인창 비활성화를 우회
        if (window.confirm.toString().includes('return true')) {
            console.log('⚠️ 즉시 삭제 시스템 감지 - 확인창 복원');
            
            // 원본 confirm 함수 복원
            if (window.originalConfirm) {
                window.confirm = window.originalConfirm;
            }
        }
    }

    // 메모 상세 모달이 열릴 때마다 삭제 버튼 강화
    function enhanceDeleteButton() {
        const deleteBtn = document.getElementById('deleteMemoBtn');
        if (deleteBtn) {
            // 기존 이벤트 리스너 제거
            const newDeleteBtn = deleteBtn.cloneNode(true);
            deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

            // 새로운 이벤트 리스너 추가
            newDeleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🗑️ 개선된 삭제 버튼 클릭됨');
                ensureDeleteConfirmation();
                window.deleteMemoFromDetail();
            });

            console.log('✅ 삭제 버튼 강화 완료');
        }
    }

    // 주기적으로 삭제 버튼 강화
    function setupDeleteButtonEnhancement() {
        enhanceDeleteButton();

        // 메모 상세 모달이 열릴 때마다 삭제 버튼 강화
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'memoDetailModal' && target.style.display === 'block') {
                        setTimeout(enhanceDeleteButton, 300);
                    }
                }
            });
        });

        const detailModal = document.getElementById('memoDetailModal');
        if (detailModal) {
            observer.observe(detailModal, { attributes: true });
        }
    }

    // 초기화
    setTimeout(() => {
        setupDeleteButtonEnhancement();
        ensureDeleteConfirmation();
        console.log('✅ 메모 삭제 개선 시스템 초기화 완료');
    }, 1000);

})();