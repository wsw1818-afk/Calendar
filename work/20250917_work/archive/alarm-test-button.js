// 알람 테스트 버튼 추가

(function() {
    // 페이지 로드 후 테스트 버튼 추가
    setTimeout(() => {
        addAlarmTestButton();
    }, 1000);

    function addAlarmTestButton() {
        // 설정 모달에 테스트 버튼 추가
        const settingsModal = document.querySelector('#settingsModal .modal-content');
        if (!settingsModal) {
            console.log('설정 모달을 찾을 수 없습니다.');
            return;
        }

        // 이미 버튼이 있으면 중복 추가하지 않음
        if (document.getElementById('alarmTestSection')) {
            return;
        }

        const testSection = document.createElement('div');
        testSection.id = 'alarmTestSection';
        testSection.className = 'form-group';
        testSection.innerHTML = `
            <label class="form-label">🔔 알람 테스트</label>
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button type="button" id="testWebAlarm" class="btn-secondary" 
                        style="padding: 8px 16px; font-size: 12px;">
                    웹 내 알람 테스트
                </button>
                <button type="button" id="testNativeAlarm" class="btn-secondary" 
                        style="padding: 8px 16px; font-size: 12px;">
                    데스크탑 알람 테스트
                </button>
                <button type="button" id="test5SecAlarm" class="btn-primary" 
                        style="padding: 8px 16px; font-size: 12px;">
                    5초 후 알람
                </button>
            </div>
            <small style="color: #666; display: block;">
                알람이 제대로 작동하는지 테스트해보세요.
            </small>
        `;

        // 설정 모달 내용 끝에 추가
        const modalBody = settingsModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.appendChild(testSection);
        } else {
            settingsModal.appendChild(testSection);
        }

        // 이벤트 리스너 추가
        document.getElementById('testWebAlarm').addEventListener('click', testWebAlarm);
        document.getElementById('testNativeAlarm').addEventListener('click', testNativeAlarm);
        document.getElementById('test5SecAlarm').addEventListener('click', test5SecondAlarm);

        console.log('✅ 알람 테스트 버튼이 추가되었습니다.');
    }

    // 웹 내 알람 테스트
    function testWebAlarm() {
        console.log('🧪 웹 내 알람 테스트 시작');
        
        const testSchedule = {
            id: 'test_' + Date.now(),
            title: '웹 알람 테스트',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            description: '웹 내 알람이 정상적으로 작동하는지 테스트입니다.',
            alarm: {
                enabled: true,
                minutesBefore: 0,
                message: '웹 알람 테스트'
            }
        };

        // 기존 showAlarmPopup 호출
        if (window.showAlarmPopup) {
            window.showAlarmPopup(testSchedule, false, true);
        } else {
            alert('❌ showAlarmPopup 함수를 찾을 수 없습니다.');
        }
    }

    // 네이티브 알람 테스트
    function testNativeAlarm() {
        console.log('🧪 네이티브 알람 테스트 시작');
        
        if (!window.nativeNotifications) {
            alert('❌ 네이티브 알림 시스템이 로드되지 않았습니다.');
            return;
        }

        // 권한 확인
        if (Notification.permission !== 'granted') {
            alert('❌ 알림 권한이 허용되지 않았습니다. 브라우저 설정에서 알림을 허용해주세요.');
            return;
        }

        const testSchedule = {
            id: 'native_test_' + Date.now(),
            title: '네이티브 알람 테스트',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            description: '데스크탑 네이티브 알림이 정상적으로 작동하는지 테스트입니다.'
        };

        window.nativeNotifications.showScheduleAlarm(testSchedule);
    }

    // 5초 후 실제 알람 테스트
    function test5SecondAlarm() {
        console.log('🧪 5초 후 알람 테스트 시작');
        
        const now = new Date();
        const futureTime = new Date(now.getTime() + 5000); // 5초 후
        
        const testSchedule = {
            id: 'timer_test_' + Date.now(),
            title: '5초 후 알람 테스트',
            date: futureTime.toISOString().split('T')[0],
            time: futureTime.toTimeString().split(' ')[0].substring(0, 5),
            description: '5초 후에 알람이 울리는 테스트입니다.',
            alarm: {
                enabled: true,
                minutesBefore: 0,
                message: '5초 후 알람 테스트 완료!'
            }
        };

        // 실제 스케줄링 시스템 사용
        if (window.scheduleAlarm) {
            window.scheduleAlarm(testSchedule);
            
            // 사용자에게 알림
            const countdownEl = document.createElement('div');
            countdownEl.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #4285f4;
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10001;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
            `;
            countdownEl.textContent = '5초 후 알람이 울립니다... 5';
            document.body.appendChild(countdownEl);

            let countdown = 4;
            const timer = setInterval(() => {
                if (countdown > 0) {
                    countdownEl.textContent = `5초 후 알람이 울립니다... ${countdown}`;
                    countdown--;
                } else {
                    countdownEl.textContent = '알람이 울려야 합니다! 🔔';
                    setTimeout(() => {
                        countdownEl.remove();
                    }, 2000);
                    clearInterval(timer);
                }
            }, 1000);

        } else {
            alert('❌ scheduleAlarm 함수를 찾을 수 없습니다.');
        }
    }

    // 권한 요청 도우미
    function requestNotificationPermission() {
        if (!('Notification' in window)) {
            alert('이 브라우저는 알림을 지원하지 않습니다.');
            return;
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('✅ 알림 권한이 허용되었습니다.');
                } else {
                    console.log('❌ 알림 권한이 거부되었습니다.');
                }
            });
        }
    }

    // 전역 함수로 등록
    window.testWebAlarm = testWebAlarm;
    window.testNativeAlarm = testNativeAlarm;
    window.test5SecondAlarm = test5SecondAlarm;
    window.requestNotificationPermission = requestNotificationPermission;

    console.log('✅ 알람 테스트 시스템이 로드되었습니다.');
    console.log('사용법: testWebAlarm(), testNativeAlarm(), test5SecondAlarm()');

})();