// 즉시 알림 테스트 - 페이지 로드 시 바로 실행

(function() {
    'use strict';

    console.log('🔔 즉시 알림 테스트 시작...');

    // 페이지 로드 후 즉시 실행
    setTimeout(() => {
        runImmediateTest();
    }, 2000); // 2초 후 실행

    function runImmediateTest() {
        console.log('📋 알림 환경 체크:');
        console.log('- Notification 지원:', 'Notification' in window);
        console.log('- 권한 상태:', Notification.permission);
        console.log('- 창 포커스:', document.hasFocus());
        console.log('- 페이지 상태:', document.visibilityState);

        // 권한이 없으면 즉시 요청
        if (Notification.permission === 'default') {
            console.log('⚠️ 권한 요청 중...');
            Notification.requestPermission().then(permission => {
                console.log('📝 권한 결과:', permission);
                if (permission === 'granted') {
                    setTimeout(() => testNotification(), 1000);
                }
            });
        } else if (Notification.permission === 'granted') {
            testNotification();
        } else {
            console.log('❌ 알림 권한이 거부되었습니다.');
            showInPageAlert('알림 권한이 거부되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.');
        }
    }

    function testNotification() {
        console.log('🧪 기본 알림 테스트 중...');

        try {
            const notification = new Notification('🔔 알림 테스트', {
                body: '이 알림이 보이면 알림이 정상 작동합니다!\n알람이 왜 안 보이는지 확인 중...',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="12" fill="%23007bff"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="14">🔔</text></svg>',
                tag: 'immediate_test',
                requireInteraction: false,
                silent: false
            });

            notification.onshow = function() {
                console.log('✅ 알림이 성공적으로 표시되었습니다!');
                showInPageAlert('✅ 기본 알림이 정상 작동합니다!', 'success');
                
                // 3초 후 네이티브 시스템 테스트
                setTimeout(() => {
                    testNativeSystem();
                }, 3000);
            };

            notification.onerror = function(error) {
                console.error('❌ 알림 표시 실패:', error);
                showInPageAlert('❌ 알림 표시 실패: ' + error.message, 'error');
            };

            notification.onclick = function() {
                console.log('👆 사용자가 테스트 알림을 클릭했습니다');
                notification.close();
            };

            // 5초 후에도 응답이 없으면 타임아웃
            setTimeout(() => {
                console.log('⏰ 알림 테스트 타임아웃');
                showInPageAlert('⚠️ 알림 테스트 타임아웃 - 알림이 나타나지 않았습니다', 'warning');
            }, 5000);

        } catch (error) {
            console.error('❌ 알림 생성 실패:', error);
            showInPageAlert('❌ 알림 생성 실패: ' + error.message, 'error');
        }
    }

    function testNativeSystem() {
        console.log('🏢 네이티브 시스템 테스트 중...');

        if (!window.nativeNotifications) {
            console.log('❌ nativeNotifications 시스템을 찾을 수 없습니다');
            showInPageAlert('❌ 네이티브 알림 시스템이 로드되지 않았습니다', 'error');
            return;
        }

        console.log('✅ nativeNotifications 시스템 발견');
        
        // 테스트 스케줄 생성
        const testSchedule = {
            id: 'immediate_test_' + Date.now(),
            title: '네이티브 시스템 테스트',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            description: '네이티브 알림 시스템이 정상 작동하는지 테스트입니다.',
            alarm: {
                enabled: true,
                minutesBefore: 0,
                message: '네이티브 시스템 테스트 완료!'
            }
        };

        try {
            console.log('📞 네이티브 알림 호출 중...');
            window.nativeNotifications.showScheduleAlarm(testSchedule);
            showInPageAlert('📞 네이티브 알림을 호출했습니다. 알림이 나타나는지 확인해주세요.', 'info');
        } catch (error) {
            console.error('❌ 네이티브 알림 호출 실패:', error);
            showInPageAlert('❌ 네이티브 알림 호출 실패: ' + error.message, 'error');
        }
    }

    function showInPageAlert(message, type = 'info') {
        // 페이지 내 알림 표시
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 15px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;

        // 애니메이션 CSS 추가
        if (!document.getElementById('alertAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'alertAnimationStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        alertDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1; margin-right: 10px;">
                    ${message}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.7;">×</button>
            </div>
        `;

        document.body.appendChild(alertDiv);

        // 10초 후 자동 제거
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                alertDiv.remove();
            }
        }, 10000);

        console.log('📢 페이지 내 알림:', message);
    }

    // 전역 함수로 등록
    window.runImmediateNotificationTest = runImmediateTest;
    
    console.log('🚀 즉시 알림 테스트 시스템 준비 완료');

})();