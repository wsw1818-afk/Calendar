// 알람 수정 시스템

(function() {
    // 페이지 로드 후 초기화
    setTimeout(() => {
        integrateAlarmEdit();
    }, 1000);

    function integrateAlarmEdit() {
        // 메모 상세보기에 알람 수정 기능 추가
        addAlarmEditToMemoDetail();
        console.log('✅ 알람 수정 시스템이 로드되었습니다.');
    }

    function addAlarmEditToMemoDetail() {
        // 기존 openMemoDetail 함수를 확장
        const originalOpenMemoDetail = window.openMemoDetail;
        
        window.openMemoDetail = function(id) {
            // 원본 함수 실행
            if (originalOpenMemoDetail) {
                originalOpenMemoDetail(id);
            }
            
            // 알람 설정 UI 추가
            setTimeout(() => {
                addAlarmControlsToModal(id);
            }, 100);
        };
    }

    function addAlarmControlsToModal(memoId) {
        const memoDetailBody = document.getElementById('memoDetailBody');
        if (!memoDetailBody) return;

        // 해당 메모 찾기
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        const memo = memos.find(m => m.id == memoId);
        
        if (!memo || !memo.isSchedule) {
            return; // 일정 메모가 아니면 알람 수정 불가
        }

        // 기존 알람 수정 UI가 있으면 제거
        const existingAlarmEdit = document.getElementById('alarmEditControls');
        if (existingAlarmEdit) {
            existingAlarmEdit.remove();
        }

        // 알람 수정 UI 생성
        const alarmEditDiv = document.createElement('div');
        alarmEditDiv.id = 'alarmEditControls';
        alarmEditDiv.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        `;

        const scheduleData = memo.scheduleData;
        const isAlarmEnabled = scheduleData?.alarm?.enabled || false;
        const currentMinutesBefore = scheduleData?.alarm?.minutesBefore || 0;

        alarmEditDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 14px;">
                🔔 알람 설정 수정
            </h4>
            
            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="editAlarmEnabled" ${isAlarmEnabled ? 'checked' : ''}>
                    <span>알람 활성화</span>
                </label>
            </div>

            <div id="editAlarmSettings" style="margin-left: 20px; ${!isAlarmEnabled ? 'display: none;' : ''}">
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">
                        알람 시간
                    </label>
                    <select id="editAlarmMinutes" style="width: 200px; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="0" ${currentMinutesBefore === 0 ? 'selected' : ''}>⚡ 바로 활성화 (지정 시간에)</option>
                        <option value="5" ${currentMinutesBefore === 5 ? 'selected' : ''}>5분 전</option>
                        <option value="10" ${currentMinutesBefore === 10 ? 'selected' : ''}>10분 전</option>
                        <option value="15" ${currentMinutesBefore === 15 ? 'selected' : ''}>15분 전</option>
                        <option value="30" ${currentMinutesBefore === 30 ? 'selected' : ''}>30분 전</option>
                        <option value="60" ${currentMinutesBefore === 60 ? 'selected' : ''}>1시간 전</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">
                        알람 메시지
                    </label>
                    <input type="text" id="editAlarmMessage" placeholder="알람 메시지 (선택사항)" 
                           value="${scheduleData?.alarm?.message || ''}"
                           style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button id="saveAlarmChanges" class="btn-primary" 
                        style="padding: 8px 16px; font-size: 12px;">
                    💾 알람 저장
                </button>
                <button id="testAlarmNow" class="btn-secondary" 
                        style="padding: 8px 16px; font-size: 12px;">
                    🧪 즉시 테스트
                </button>
            </div>
        `;

        // 메모 상세 본문 다음에 추가
        memoDetailBody.parentNode.insertBefore(alarmEditDiv, memoDetailBody.nextSibling);

        // 이벤트 리스너 추가
        setupAlarmEditEvents(memoId, memo);
    }

    function setupAlarmEditEvents(memoId, memo) {
        // 알람 활성화 체크박스
        const enabledCheckbox = document.getElementById('editAlarmEnabled');
        const settingsDiv = document.getElementById('editAlarmSettings');
        
        enabledCheckbox.addEventListener('change', function() {
            settingsDiv.style.display = this.checked ? 'block' : 'none';
        });

        // 알람 저장 버튼
        document.getElementById('saveAlarmChanges').addEventListener('click', function() {
            saveAlarmChanges(memoId, memo);
        });

        // 즉시 테스트 버튼
        document.getElementById('testAlarmNow').addEventListener('click', function() {
            testAlarmNow(memo);
        });
    }

    function saveAlarmChanges(memoId, memo) {
        const enabled = document.getElementById('editAlarmEnabled').checked;
        const minutesBefore = parseInt(document.getElementById('editAlarmMinutes').value);
        const message = document.getElementById('editAlarmMessage').value.trim();

        console.log('💾 알람 설정 저장 중:', { enabled, minutesBefore, message });

        // 메모 데이터 업데이트
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        const memoIndex = memos.findIndex(m => m.id == memoId);
        
        if (memoIndex === -1) {
            alert('메모를 찾을 수 없습니다.');
            return;
        }

        // 스케줄 데이터도 업데이트
        let schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '[]');
        const scheduleIndex = schedules.findIndex(s => s.id == memoId);

        // 알람 설정 업데이트
        const alarmData = {
            enabled: enabled,
            minutesBefore: minutesBefore,
            message: message || memo.title
        };

        // 메모 데이터 업데이트
        if (memos[memoIndex].scheduleData) {
            memos[memoIndex].scheduleData.alarm = alarmData;
        }
        memos[memoIndex].alarmEnabled = enabled;
        memos[memoIndex].alarmTime = minutesBefore === 0 ? '바로 알림' : `${minutesBefore}분 전`;

        // 메모 content 업데이트 (시간 표시 부분)
        const scheduleData = memos[memoIndex].scheduleData;
        if (scheduleData) {
            memos[memoIndex].content = `⏰ ${scheduleData.time}${enabled ? ' 🔔' : ''} | ${scheduleData.description || '일정'}`;
        }

        // 스케줄 데이터 업데이트
        if (scheduleIndex !== -1) {
            schedules[scheduleIndex].alarm = alarmData;
        }

        // 로컬 스토리지 저장
        localStorage.setItem('calendarMemos', JSON.stringify(memos));
        localStorage.setItem('calendarSchedules', JSON.stringify(schedules));

        // 기존 알람 취소
        if (window.activeAlarms && window.activeAlarms.has(memoId)) {
            clearTimeout(window.activeAlarms.get(memoId));
            window.activeAlarms.delete(memoId);
        }

        // 새 알람 설정
        if (enabled && scheduleIndex !== -1) {
            window.scheduleAlarm(schedules[scheduleIndex]);
        }

        // UI 새로고침
        if (window.memoSystemRefresh) {
            window.memoSystemRefresh();
        }

        // 성공 메시지
        const saveBtn = document.getElementById('saveAlarmChanges');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ 저장됨!';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }, 2000);

        console.log('✅ 알람 설정이 저장되었습니다.');
    }

    function testAlarmNow(memo) {
        console.log('🧪 즉시 알람 테스트:', memo);

        if (!window.nativeNotifications) {
            alert('네이티브 알림 시스템이 없습니다.');
            return;
        }

        const testSchedule = {
            ...memo.scheduleData,
            title: `${memo.scheduleData.title} (테스트)`,
            alarm: {
                enabled: true,
                minutesBefore: 0,
                message: document.getElementById('editAlarmMessage').value.trim() || '테스트 알람'
            }
        };

        window.nativeNotifications.showScheduleAlarm(testSchedule);

        // 버튼 피드백
        const testBtn = document.getElementById('testAlarmNow');
        const originalText = testBtn.textContent;
        testBtn.textContent = '🔔 테스트 완료!';
        testBtn.disabled = true;
        
        setTimeout(() => {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }, 3000);
    }

    // 전역 함수로 등록
    window.saveAlarmChanges = saveAlarmChanges;
    window.testAlarmNow = testAlarmNow;

})();