// 네이티브 데스크탑 알림 시스템
class NativeNotificationSystem {
    constructor() {
        this.permission = null;
        this.activeNotifications = new Map();
        this.init();
    }

    async init() {
        await this.requestPermission();
    }

    // 알림 권한 요청
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('이 브라우저는 데스크탑 알림을 지원하지 않습니다.');
            return false;
        }

        try {
            this.permission = await Notification.requestPermission();
            if (this.permission === 'granted') {
                console.log('✅ 데스크탑 알림 권한이 허용되었습니다.');
                return true;
            } else {
                console.warn('❌ 데스크탑 알림 권한이 거부되었습니다.');
                return false;
            }
        } catch (error) {
            console.error('알림 권한 요청 중 오류:', error);
            return false;
        }
    }

    // 네이티브 알림 표시
    showNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.warn('알림 권한이 없습니다. 웹 내 알림으로 대체합니다.');
            this.showWebNotification(title, options);
            return null;
        }

        const defaultOptions = {
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0Mjg1RjQiLz4KPHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHg9IjE2IiB5PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xOSAzaC0xVjFoLTJ2Mkg4VjFINnYySDVjLTEuMTEgMC0yIC44OS0yIDJ2MTRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMTEtLjg5LTItMi0yem0wIDE2SDVWOGgxNHYxMXoiLz4KPC9zdmc+Cjwvc3ZnPg==',
            badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGRjU3MjIiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSI+8J+ThTwvdGV4dD4KPC9zdmc+',
            tag: 'calendar-alarm',
            renotify: true,
            requireInteraction: false,
            silent: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            // 알림 이벤트 처리
            notification.onclick = () => {
                // 브라우저 창 포커스
                window.focus();
                
                // 커스텀 클릭 핸들러가 있으면 실행
                if (options.onClick) {
                    options.onClick();
                }
                
                notification.close();
            };

            notification.onerror = (error) => {
                console.error('알림 표시 중 오류:', error);
            };

            // 자동 닫힘 (기본 5초)
            if (options.autoClose !== false) {
                const duration = options.duration || 5000;
                setTimeout(() => {
                    notification.close();
                }, duration);
            }

            // 활성 알림 목록에 추가
            const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.activeNotifications.set(notificationId, notification);

            // 닫힐 때 목록에서 제거
            notification.onclose = () => {
                this.activeNotifications.delete(notificationId);
                if (options.onClose) {
                    options.onClose();
                }
            };

            return notification;

        } catch (error) {
            console.error('네이티브 알림 생성 중 오류:', error);
            // 네이티브 알림이 실패하면 웹 내 알림으로 대체
            this.showWebNotification(title, options);
            return null;
        }
    }

    // 웹 내 알림 (네이티브 알림이 불가능할 때 대체용)
    showWebNotification(title, options = {}) {
        // 기존 웹 알림 팝업을 재사용하거나 새로 생성
        let popup = document.querySelector('.alarm-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'alarm-popup';
            document.body.appendChild(popup);
        }

        const message = options.body || '';
        const icon = options.icon ? `<img src="${options.icon}" style="width: 24px; height: 24px; margin-right: 10px;">` : '📅';
        
        popup.innerHTML = `
            <div class="alarm-content">
                <div class="alarm-header">
                    ${icon}
                    <strong>${title}</strong>
                    <button class="close-alarm" onclick="this.parentElement.parentElement.parentElement.style.display='none'">×</button>
                </div>
                ${message ? `<div class="alarm-body">${message}</div>` : ''}
            </div>
        `;

        popup.style.display = 'block';
        popup.style.zIndex = '10000';

        // 자동 닫힘
        if (options.autoClose !== false) {
            const duration = options.duration || 5000;
            setTimeout(() => {
                if (popup) {
                    popup.style.display = 'none';
                }
            }, duration);
        }

        // 클릭 이벤트
        if (options.onClick) {
            popup.addEventListener('click', options.onClick, { once: true });
        }
    }

    // 일정 알람을 위한 특화된 메서드
    showScheduleAlarm(schedule) {
        const title = `📅 일정 알림: ${schedule.title}`;
        const body = this.formatScheduleBody(schedule);
        
        const options = {
            body: body,
            tag: `schedule_${schedule.id}`,
            data: schedule,
            onClick: () => {
                // 해당 일정으로 이동하거나 상세 정보 표시
                this.focusOnSchedule(schedule);
            },
            duration: 10000 // 일정 알림은 조금 더 오래 표시
        };

        return this.showNotification(title, options);
    }

    // 일정 정보 포맷팅
    formatScheduleBody(schedule) {
        let body = '';
        
        if (schedule.time) {
            body += `⏰ ${schedule.time}\n`;
        }
        
        if (schedule.description && schedule.description.trim()) {
            body += `📝 ${schedule.description}\n`;
        }
        
        if (schedule.location && schedule.location.trim()) {
            body += `📍 ${schedule.location}`;
        }

        return body.trim() || '일정이 예정되어 있습니다.';
    }

    // 특정 일정에 포커스
    focusOnSchedule(schedule) {
        // 달력에서 해당 날짜로 이동
        if (schedule.date) {
            const dateInput = document.querySelector('input[type="date"]');
            if (dateInput) {
                dateInput.value = schedule.date;
                dateInput.dispatchEvent(new Event('change'));
            }
        }

        // 해당 일정 하이라이트 또는 상세 보기 열기
        setTimeout(() => {
            const scheduleElement = document.querySelector(`[data-schedule-id="${schedule.id}"]`);
            if (scheduleElement) {
                scheduleElement.scrollIntoView({ behavior: 'smooth' });
                scheduleElement.classList.add('highlight-schedule');
                setTimeout(() => {
                    scheduleElement.classList.remove('highlight-schedule');
                }, 3000);
            }
        }, 500);
    }

    // 모든 활성 알림 닫기
    closeAllNotifications() {
        this.activeNotifications.forEach(notification => {
            notification.close();
        });
        this.activeNotifications.clear();
    }

    // 권한 상태 확인
    getPermissionStatus() {
        return this.permission;
    }

    // 알림 지원 여부 확인
    isSupported() {
        return 'Notification' in window;
    }

    // 테스트 알림
    showTestNotification() {
        return this.showNotification('📅 테스트 알림', {
            body: '데스크탑 알림이 정상적으로 작동합니다!',
            onClick: () => {
                console.log('테스트 알림을 클릭했습니다.');
            }
        });
    }
}

// 전역 인스턴스 생성
window.nativeNotifications = new NativeNotificationSystem();

// 스타일 추가 (웹 내 알림용)
const style = document.createElement('style');
style.textContent = `
    .alarm-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #4285f4;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        display: none;
        animation: slideInRight 0.3s ease-out;
    }

    .alarm-content {
        padding: 16px;
    }

    .alarm-header {
        display: flex;
        align-items: center;
        font-weight: bold;
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
    }

    .alarm-body {
        color: #666;
        font-size: 13px;
        line-height: 1.4;
        white-space: pre-line;
    }

    .close-alarm {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-alarm:hover {
        color: #333;
    }

    .highlight-schedule {
        background-color: #fff3cd !important;
        border: 2px solid #ffc107 !important;
        animation: pulse 1s ease-in-out 3;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    /* 다크 모드 지원 */
    @media (prefers-color-scheme: dark) {
        .alarm-popup {
            background: #2d3748;
            border-color: #4299e1;
            color: white;
        }
        
        .alarm-header {
            color: #e2e8f0;
        }
        
        .alarm-body {
            color: #cbd5e0;
        }
        
        .close-alarm {
            color: #a0aec0;
        }
        
        .close-alarm:hover {
            color: #e2e8f0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ 네이티브 알림 시스템이 로드되었습니다.');