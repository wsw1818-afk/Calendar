// 기존 알람 시스템과 네이티브 알림 연동

// 원본 scheduleAlarm 함수를 백업하고 확장
(function() {
    // 기존 scheduleAlarm 함수가 정의되기를 기다림
    function waitForScheduleAlarm() {
        if (typeof scheduleAlarm === 'function') {
            integrateNativeAlarms();
        } else {
            setTimeout(waitForScheduleAlarm, 100);
        }
    }

    function integrateNativeAlarms() {
        // 기존 scheduleAlarm 함수를 백업
        const originalScheduleAlarm = window.scheduleAlarm;

        // scheduleAlarm 함수를 네이티브 알림 지원으로 확장
        window.scheduleAlarm = function(schedule) {
            console.log('📅 일정 알람 설정:', schedule);

            if (!schedule.alarm || !schedule.alarm.enabled) {
                console.log('알람이 비활성화되어 있습니다.');
                return;
            }

            const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
            const minutesBefore = schedule.alarm.minutesBefore || 0; // 기본값을 0으로 변경
            
            // 알람 시간 계산: minutesBefore가 0이면 일정 시간에, 아니면 그 만큼 일찍
            let alarmTime;
            if (minutesBefore === 0) {
                alarmTime = new Date(scheduleDateTime.getTime()); // 일정 시간 정확히
            } else {
                alarmTime = new Date(scheduleDateTime.getTime() - (minutesBefore * 60 * 1000)); // 일정 시간 전
            }
            
            const now = new Date();

            console.log('📋 일정 시간:', scheduleDateTime);
            console.log('🔔 알람 설정 시간:', alarmTime);
            console.log('⏰ 현재 시간:', now);
            console.log('📏 알람까지 남은 시간:', Math.round((alarmTime.getTime() - now.getTime()) / 1000), '초');

            if (alarmTime <= now) {
                console.log('⚠️ 알람 시간이 현재보다 이전입니다. 즉시 알람 표시');
                // 즉시 알람 표시 - 웹 팝업과 네이티브 알림 둘 다 표시
                if (window.showAlarmPopup) {
                    window.showAlarmPopup(schedule, false, true); // 즉시 알람으로 표시
                } else {
                    showNativeAlarm(schedule);
                }
                return;
            }

            const timeUntilAlarm = alarmTime.getTime() - now.getTime();
            console.log(`알람까지 남은 시간: ${Math.round(timeUntilAlarm / 1000)}초`);

            // 기존 알람이 있으면 취소
            if (activeAlarms && activeAlarms.has(schedule.id)) {
                clearTimeout(activeAlarms.get(schedule.id));
                activeAlarms.delete(schedule.id);
            }

            // 새 알람 설정
            const alarmTimeout = setTimeout(() => {
                // 웹 팝업과 네이티브 알림 둘 다 표시
                if (window.showAlarmPopup) {
                    window.showAlarmPopup(schedule, false, false); // 정시 알람으로 표시
                } else {
                    showNativeAlarm(schedule);
                }
                
                // 반복 알람 처리
                if (schedule.alarm.repeat && schedule.alarm.repeat !== 'none') {
                    handleRepeatAlarm(schedule);
                }
                
                // 활성 알람 목록에서 제거
                if (activeAlarms) {
                    activeAlarms.delete(schedule.id);
                }
            }, timeUntilAlarm);

            // 활성 알람 목록에 추가
            if (activeAlarms) {
                activeAlarms.set(schedule.id, alarmTimeout);
            }

            console.log(`✅ 알람이 설정되었습니다. ID: ${schedule.id}`);
        };

        // showAlarm 함수도 네이티브 알림으로 확장
        const originalShowAlarm = window.showAlarm;
        const originalShowAlarmPopup = window.showAlarmPopup;
        
        window.showAlarm = function(schedule) {
            // 기존 웹 내 알람도 표시
            if (originalShowAlarm) {
                originalShowAlarm(schedule);
            }
            
            // 네이티브 알림도 표시
            showNativeAlarm(schedule);
        };

        // showAlarmPopup 함수도 네이티브 알림으로 확장
        window.showAlarmPopup = function(schedule, isRepeating = false, isImmediate = false) {
            console.log('🔔 showAlarmPopup 호출됨:', schedule, isRepeating, isImmediate);
            
            // 기존 웹 내 알람도 표시
            if (originalShowAlarmPopup) {
                originalShowAlarmPopup(schedule, isRepeating, isImmediate);
            }
            
            // 네이티브 알림도 표시
            showNativeAlarm(schedule);
        };

        console.log('✅ 네이티브 알림 연동이 완료되었습니다.');
    }

    // 네이티브 알림 표시 함수
    function showNativeAlarm(schedule) {
        console.log('🔔 네이티브 알람 표시:', schedule);

        if (!window.nativeNotifications) {
            console.error('네이티브 알림 시스템이 로드되지 않았습니다.');
            return;
        }

        // 알람 메시지 포맷팅
        const title = `📅 일정 알림: ${schedule.title}`;
        let body = '';
        
        if (schedule.time) {
            const timeStr = schedule.time;
            body += `⏰ ${timeStr}\n`;
        }
        
        if (schedule.description && schedule.description.trim()) {
            body += `📝 ${schedule.description}\n`;
        }
        
        // 얼마나 일찍 알림인지 표시
        if (schedule.alarm && schedule.alarm.minutesBefore > 0) {
            body += `⏱️ ${schedule.alarm.minutesBefore}분 전 알림`;
        } else {
            body += `⚡ 바로 알림`;
        }

        // 네이티브 알림 표시
        const notification = window.nativeNotifications.showNotification(title, {
            body: body.trim(),
            tag: `schedule_${schedule.id}`,
            data: schedule,
            onClick: () => {
                console.log('알림을 클릭했습니다:', schedule);
                focusOnSchedule(schedule);
            },
            duration: 15000, // 15초간 표시
            requireInteraction: true // 사용자가 직접 닫을 때까지 표시
        });

        // 알림음 재생 (브라우저에서 지원하는 경우)
        playNotificationSound();

        console.log('✅ 네이티브 알림이 표시되었습니다.');
    }

    // 반복 알람 처리
    function handleRepeatAlarm(schedule) {
        if (!schedule.alarm.repeat || schedule.alarm.repeat === 'none') {
            return;
        }

        let intervalMinutes = 0;
        switch (schedule.alarm.repeat) {
            case '5': intervalMinutes = 5; break;
            case '10': intervalMinutes = 10; break;
            case '15': intervalMinutes = 15; break;
            default: return;
        }

        console.log(`🔁 반복 알람 설정: ${intervalMinutes}분 간격`);

        // 최대 3번까지 반복
        let repeatCount = 0;
        const maxRepeats = 3;

        const repeatAlarm = () => {
            if (repeatCount >= maxRepeats) {
                console.log('반복 알람 완료');
                return;
            }

            setTimeout(() => {
                repeatCount++;
                console.log(`🔁 반복 알람 ${repeatCount}/${maxRepeats}`);
                showNativeAlarm({
                    ...schedule,
                    title: `${schedule.title} (${repeatCount}회차 알림)`
                });
                
                if (repeatCount < maxRepeats) {
                    repeatAlarm();
                }
            }, intervalMinutes * 60 * 1000);
        };

        repeatAlarm();
    }

    // 특정 일정에 포커스
    function focusOnSchedule(schedule) {
        try {
            // 브라우저 창 포커스
            window.focus();

            // 달력에서 해당 날짜로 이동
            if (schedule.date) {
                const dateInput = document.querySelector('#scheduleDate, input[type="date"]');
                if (dateInput) {
                    dateInput.value = schedule.date;
                    dateInput.dispatchEvent(new Event('change'));
                }
            }

            // 해당 일정 찾아서 하이라이트
            setTimeout(() => {
                // 일정 요소들 검색
                const scheduleElements = document.querySelectorAll(`
                    [data-schedule-id="${schedule.id}"],
                    .schedule-item:contains("${schedule.title}"),
                    .event:contains("${schedule.title}")
                `);

                let foundElement = null;
                scheduleElements.forEach(el => {
                    if (el.textContent.includes(schedule.title)) {
                        foundElement = el;
                    }
                });

                // 일정을 찾지 못했으면 제목으로 검색
                if (!foundElement) {
                    const allElements = document.querySelectorAll('*');
                    for (let el of allElements) {
                        if (el.textContent.includes(schedule.title) && 
                            el.children.length === 0) { // 텍스트 노드만
                            foundElement = el.closest('.schedule-item, .event, .memo-item');
                            if (foundElement) break;
                        }
                    }
                }

                if (foundElement) {
                    foundElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // 하이라이트 효과
                    foundElement.style.transition = 'all 0.3s ease';
                    foundElement.style.backgroundColor = '#fff3cd';
                    foundElement.style.border = '2px solid #ffc107';
                    foundElement.style.transform = 'scale(1.02)';
                    
                    setTimeout(() => {
                        foundElement.style.backgroundColor = '';
                        foundElement.style.border = '';
                        foundElement.style.transform = '';
                    }, 3000);
                    
                    console.log('✅ 일정이 하이라이트되었습니다:', schedule.title);
                } else {
                    console.log('⚠️ 해당 일정을 찾을 수 없습니다:', schedule.title);
                    // 일정 목록을 새로고침하거나 모달을 열어 상세정보 표시
                    showScheduleDetails(schedule);
                }
            }, 500);

        } catch (error) {
            console.error('일정 포커스 중 오류:', error);
        }
    }

    // 일정 상세정보 표시
    function showScheduleDetails(schedule) {
        const details = `
📅 일정 정보
━━━━━━━━━━━━━━━
📋 제목: ${schedule.title}
📅 날짜: ${schedule.date}
⏰ 시간: ${schedule.time}
${schedule.description ? `📝 내용: ${schedule.description}` : ''}
${schedule.alarm?.enabled ? `🔔 알람: ${schedule.alarm.minutesBefore}분 전` : ''}
        `.trim();

        alert(details);
    }

    // 알림음 재생
    function playNotificationSound() {
        try {
            // 웹 오디오 API를 사용한 간단한 알림음
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
        } catch (error) {
            console.log('알림음 재생 실패:', error);
        }
    }

    // 권한 요청 버튼 추가
    function addNotificationPermissionUI() {
        // 알림 권한 상태 확인
        if (!('Notification' in window)) {
            console.log('이 브라우저는 알림을 지원하지 않습니다.');
            return;
        }

        // 권한이 이미 허용되어 있으면 UI 추가 안함
        if (Notification.permission === 'granted') {
            return;
        }

        // 설정 모달에 권한 요청 버튼 추가
        setTimeout(() => {
            const settingsModal = document.querySelector('#settingsModal .modal-content');
            if (settingsModal && !document.querySelector('#notificationPermissionBtn')) {
                const permissionSection = document.createElement('div');
                permissionSection.className = 'form-group';
                permissionSection.innerHTML = `
                    <label class="form-label">🔔 데스크탑 알림</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button type="button" id="notificationPermissionBtn" class="btn-secondary" 
                                style="padding: 8px 16px; font-size: 12px;">
                            알림 권한 허용
                        </button>
                        <span id="notificationStatus" style="font-size: 12px; color: #666;">
                            ${Notification.permission === 'denied' ? '❌ 거부됨' : '⏳ 미설정'}
                        </span>
                    </div>
                    <small style="color: #666; display: block; margin-top: 5px;">
                        웹 밖 윈도우 화면에서도 알림을 보려면 권한을 허용해주세요.
                    </small>
                `;
                
                // 테마 설정 다음에 추가
                const themeGroup = settingsModal.querySelector('.form-group');
                if (themeGroup) {
                    themeGroup.parentNode.insertBefore(permissionSection, themeGroup.nextSibling);
                }

                // 버튼 클릭 이벤트
                document.getElementById('notificationPermissionBtn').addEventListener('click', async () => {
                    const permission = await Notification.requestPermission();
                    const statusEl = document.getElementById('notificationStatus');
                    const btnEl = document.getElementById('notificationPermissionBtn');
                    
                    if (permission === 'granted') {
                        statusEl.textContent = '✅ 허용됨';
                        statusEl.style.color = '#28a745';
                        btnEl.textContent = '테스트 알림';
                        btnEl.onclick = () => {
                            window.nativeNotifications?.showTestNotification();
                        };
                    } else {
                        statusEl.textContent = '❌ 거부됨';
                        statusEl.style.color = '#dc3545';
                    }
                });
            }
        }, 1000);
    }

    // 초기화
    setTimeout(() => {
        waitForScheduleAlarm();
        addNotificationPermissionUI();
        
        // 페이지 로드 시 권한 요청 (선택적)
        if (window.nativeNotifications && Notification.permission === 'default') {
            console.log('💡 데스크탑 알림을 사용하려면 설정에서 권한을 허용해주세요.');
        }
    }, 500);

    console.log('✅ 알람 연동 시스템이 로드되었습니다.');

})();