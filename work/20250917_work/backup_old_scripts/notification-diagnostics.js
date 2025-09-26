// 알림 진단 시스템 - 알람이 왜 보이지 않는지 확인

(function() {
    'use strict';

    // 진단 결과를 저장할 객체
    window.notificationDiagnostics = {
        results: {},
        logs: [],
        
        // 로그 추가
        log: function(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = { timestamp, message, type };
            this.logs.push(logEntry);
            console.log(`[진단 ${timestamp}] ${message}`);
        },

        // 전체 진단 실행
        runFullDiagnostics: async function() {
            this.log('🔍 알림 진단 시작', 'info');
            
            await this.checkBrowserSupport();
            await this.checkPermissions();
            await this.checkNotificationSettings();
            await this.checkSystemSettings();
            await this.testBasicNotification();
            await this.checkNativeNotificationSystem();
            
            this.displayResults();
        },

        // 브라우저 지원 확인
        checkBrowserSupport: function() {
            this.log('1. 브라우저 지원 확인 중...', 'info');
            
            const support = {
                notification: 'Notification' in window,
                serviceWorker: 'serviceWorker' in navigator,
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };

            this.results.browserSupport = support;
            
            if (!support.notification) {
                this.log('❌ 이 브라우저는 Notification API를 지원하지 않습니다!', 'error');
            } else {
                this.log('✅ Notification API 지원됨', 'success');
            }
        },

        // 권한 상태 확인
        checkPermissions: function() {
            this.log('2. 알림 권한 확인 중...', 'info');
            
            if (!('Notification' in window)) {
                this.results.permissions = { status: 'not_supported' };
                return;
            }

            const permission = Notification.permission;
            this.results.permissions = { status: permission };
            
            switch (permission) {
                case 'granted':
                    this.log('✅ 알림 권한: 허용됨', 'success');
                    break;
                case 'denied':
                    this.log('❌ 알림 권한: 거부됨 - 브라우저 설정에서 허용 필요', 'error');
                    break;
                case 'default':
                    this.log('⚠️ 알림 권한: 미설정 - 권한 요청 필요', 'warning');
                    break;
            }
        },

        // 알림 설정 확인
        checkNotificationSettings: function() {
            this.log('3. 브라우저 알림 설정 확인 중...', 'info');
            
            // 브라우저별 특정 설정 확인
            const settings = {
                maxActions: Notification.maxActions || 0,
                prototype: Object.getOwnPropertyNames(Notification.prototype),
                windowFocus: document.hasFocus(),
                visibility: document.visibilityState
            };

            this.results.notificationSettings = settings;
            
            this.log(`📊 최대 액션 수: ${settings.maxActions}`, 'info');
            this.log(`🔍 창 포커스: ${settings.windowFocus ? '예' : '아니오'}`, 'info');
            this.log(`👁️ 페이지 가시성: ${settings.visibility}`, 'info');
        },

        // 시스템 설정 확인 (가능한 범위에서)
        checkSystemSettings: function() {
            this.log('4. 시스템 설정 추정 중...', 'info');
            
            const systemInfo = {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                onLine: navigator.onLine,
                cookieEnabled: navigator.cookieEnabled
            };

            this.results.systemSettings = systemInfo;
            
            this.log(`🌍 시간대: ${systemInfo.timezone}`, 'info');
            this.log(`🗣️ 언어: ${systemInfo.language}`, 'info');
            this.log(`🌐 온라인: ${systemInfo.onLine ? '예' : '아니오'}`, 'info');
        },

        // 기본 알림 테스트
        testBasicNotification: async function() {
            this.log('5. 기본 알림 테스트 중...', 'info');
            
            if (Notification.permission !== 'granted') {
                this.log('❌ 권한이 없어서 기본 알림 테스트를 건너뜁니다', 'error');
                this.results.basicTest = { status: 'permission_denied' };
                return;
            }

            try {
                const notification = new Notification('진단 테스트', {
                    body: '이 알림이 보이면 기본 알림이 정상 작동합니다.',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="24" font-size="24">🔔</text></svg>',
                    tag: 'diagnostic_test',
                    requireInteraction: false
                });

                notification.onshow = () => {
                    this.log('✅ 기본 알림이 표시되었습니다!', 'success');
                    this.results.basicTest = { status: 'success', shown: true };
                    
                    // 3초 후 자동 닫기
                    setTimeout(() => notification.close(), 3000);
                };

                notification.onerror = (error) => {
                    this.log('❌ 기본 알림 표시 중 오류: ' + error.message, 'error');
                    this.results.basicTest = { status: 'error', error: error.message };
                };

                notification.onclick = () => {
                    this.log('👆 사용자가 진단 알림을 클릭했습니다', 'info');
                    notification.close();
                };

                // 타임아웃 설정
                setTimeout(() => {
                    if (!this.results.basicTest) {
                        this.log('⏰ 기본 알림 응답 타임아웃', 'warning');
                        this.results.basicTest = { status: 'timeout' };
                    }
                }, 5000);

            } catch (error) {
                this.log('❌ 기본 알림 생성 실패: ' + error.message, 'error');
                this.results.basicTest = { status: 'creation_failed', error: error.message };
            }
        },

        // 네이티브 알림 시스템 확인
        checkNativeNotificationSystem: function() {
            this.log('6. 네이티브 알림 시스템 확인 중...', 'info');
            
            const systemCheck = {
                nativeNotificationsExists: !!window.nativeNotifications,
                scheduleAlarmExists: !!window.scheduleAlarm,
                showAlarmPopupExists: !!window.showAlarmPopup,
                activeAlarmsExists: !!window.activeAlarms,
                activeAlarmsSize: window.activeAlarms ? window.activeAlarms.size : 0
            };

            this.results.nativeSystem = systemCheck;
            
            if (systemCheck.nativeNotificationsExists) {
                this.log('✅ nativeNotifications 시스템 발견', 'success');
                
                // 추가 시스템 정보
                if (window.nativeNotifications) {
                    const nativeInfo = {
                        permission: window.nativeNotifications.permission,
                        supported: window.nativeNotifications.isSupported,
                        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(window.nativeNotifications))
                    };
                    this.results.nativeSystemInfo = nativeInfo;
                    this.log(`📋 네이티브 시스템 권한: ${nativeInfo.permission}`, 'info');
                }
            } else {
                this.log('❌ nativeNotifications 시스템을 찾을 수 없습니다', 'error');
            }

            if (systemCheck.scheduleAlarmExists) {
                this.log('✅ scheduleAlarm 함수 발견', 'success');
            } else {
                this.log('❌ scheduleAlarm 함수를 찾을 수 없습니다', 'error');
            }

            this.log(`📊 현재 활성 알람 수: ${systemCheck.activeAlarmsSize}`, 'info');
        },

        // 결과 표시
        displayResults: function() {
            this.log('📋 진단 완료! 결과를 표시합니다.', 'success');
            
            // 모달 생성
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            `;

            content.innerHTML = this.generateDiagnosticsHTML();
            modal.appendChild(content);
            document.body.appendChild(modal);

            // 모달 닫기
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            };

            // 5분 후 자동 닫기
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    modal.remove();
                }
            }, 300000);
        },

        // 진단 결과 HTML 생성
        generateDiagnosticsHTML: function() {
            const results = this.results;
            let html = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #333; margin: 0;">🔍 알림 시스템 진단 결과</h2>
                    <p style="color: #666; margin: 5px 0;">알람이 보이지 않는 이유를 찾았습니다</p>
                </div>
            `;

            // 브라우저 지원
            html += '<div style="margin-bottom: 20px;">';
            html += '<h3 style="color: #007bff;">1. 브라우저 지원</h3>';
            if (results.browserSupport?.notification) {
                html += '<p style="color: #28a745;">✅ Notification API 지원됨</p>';
            } else {
                html += '<p style="color: #dc3545;">❌ Notification API 미지원</p>';
            }
            html += `<small>브라우저: ${results.browserSupport?.userAgent}</small>`;
            html += '</div>';

            // 권한 상태
            html += '<div style="margin-bottom: 20px;">';
            html += '<h3 style="color: #007bff;">2. 알림 권한</h3>';
            const permission = results.permissions?.status;
            if (permission === 'granted') {
                html += '<p style="color: #28a745;">✅ 권한 허용됨</p>';
            } else if (permission === 'denied') {
                html += '<p style="color: #dc3545;">❌ 권한 거부됨</p>';
                html += '<p style="font-size: 14px; color: #666;">해결방법: 브라우저 주소표시줄 자물쇠 아이콘 → 알림 허용</p>';
            } else {
                html += '<p style="color: #ffc107;">⚠️ 권한 미설정</p>';
                html += '<button onclick="Notification.requestPermission()" style="padding: 5px 10px; margin: 5px 0;">권한 요청</button>';
            }
            html += '</div>';

            // 기본 테스트
            html += '<div style="margin-bottom: 20px;">';
            html += '<h3 style="color: #007bff;">3. 기본 알림 테스트</h3>';
            const basicTest = results.basicTest;
            if (basicTest?.status === 'success') {
                html += '<p style="color: #28a745;">✅ 기본 알림 정상 작동</p>';
            } else if (basicTest?.status === 'permission_denied') {
                html += '<p style="color: #dc3545;">❌ 권한 없음</p>';
            } else if (basicTest?.error) {
                html += `<p style="color: #dc3545;">❌ 오류: ${basicTest.error}</p>`;
            } else {
                html += '<p style="color: #ffc107;">⚠️ 테스트 미완료</p>';
            }
            html += '</div>';

            // 네이티브 시스템
            html += '<div style="margin-bottom: 20px;">';
            html += '<h3 style="color: #007bff;">4. 알람 시스템 상태</h3>';
            const nativeSystem = results.nativeSystem;
            if (nativeSystem?.nativeNotificationsExists) {
                html += '<p style="color: #28a745;">✅ 네이티브 알림 시스템 로드됨</p>';
            } else {
                html += '<p style="color: #dc3545;">❌ 네이티브 알림 시스템 미발견</p>';
            }
            if (nativeSystem?.scheduleAlarmExists) {
                html += '<p style="color: #28a745;">✅ 알람 스케줄러 존재</p>';
            } else {
                html += '<p style="color: #dc3545;">❌ 알람 스케줄러 미발견</p>';
            }
            html += `<p>📊 활성 알람: ${nativeSystem?.activeAlarmsSize || 0}개</p>`;
            html += '</div>';

            // 시스템 정보
            html += '<div style="margin-bottom: 20px;">';
            html += '<h3 style="color: #007bff;">5. 시스템 정보</h3>';
            html += `<p>🔍 창 포커스: ${results.notificationSettings?.windowFocus ? '예' : '아니오'}</p>`;
            html += `<p>👁️ 페이지 상태: ${results.notificationSettings?.visibility}</p>`;
            html += `<p>🌐 온라인: ${results.systemSettings?.onLine ? '예' : '아니오'}</p>`;
            html += '</div>';

            // 추천 해결방법
            html += '<div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">';
            html += '<h3 style="color: #007bff; margin-top: 0;">🔧 추천 해결방법</h3>';
            
            if (permission !== 'granted') {
                html += '<p>1️⃣ <strong>브라우저 알림 권한 허용</strong></p>';
                html += '<p style="margin-left: 20px; font-size: 14px;">주소표시줄의 자물쇠 아이콘 클릭 → 알림 → 허용</p>';
            }
            
            if (!results.basicTest?.shown) {
                html += '<p>2️⃣ <strong>Windows 알림 설정 확인</strong></p>';
                html += '<p style="margin-left: 20px; font-size: 14px;">Windows 설정 → 시스템 → 알림 및 작업 → 브라우저 앱에서 알림 허용</p>';
            }
            
            html += '<p>3️⃣ <strong>브라우저 새로고침</strong></p>';
            html += '<p style="margin-left: 20px; font-size: 14px;">Ctrl+F5로 페이지 새로고침 후 다시 테스트</p>';
            
            html += '</div>';

            // 로그
            if (this.logs.length > 0) {
                html += '<div style="margin-top: 20px;">';
                html += '<h3 style="color: #007bff;">📝 상세 로그</h3>';
                html += '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto; font-size: 12px;">';
                this.logs.forEach(log => {
                    const color = log.type === 'error' ? '#dc3545' : log.type === 'success' ? '#28a745' : log.type === 'warning' ? '#ffc107' : '#666';
                    html += `<div style="color: ${color};">${log.timestamp} - ${log.message}</div>`;
                });
                html += '</div>';
                html += '</div>';
            }

            // 닫기 버튼
            html += `
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                            style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        닫기
                    </button>
                </div>
            `;

            return html;
        }
    };

    // 페이지 로드 후 자동 진단 (설정에서 켤 수 있도록)
    setTimeout(() => {
        // 진단 버튼을 설정 모달에 추가
        const settingsModal = document.querySelector('#settingsModal .modal-content');
        if (settingsModal && !document.getElementById('diagnosticsSection')) {
            const diagnosticsSection = document.createElement('div');
            diagnosticsSection.id = 'diagnosticsSection';
            diagnosticsSection.className = 'form-group';
            diagnosticsSection.innerHTML = `
                <label class="form-label">🔍 알림 진단</label>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button type="button" id="runDiagnostics" class="btn-primary" 
                            style="padding: 8px 16px; font-size: 12px;">
                        전체 진단 실행
                    </button>
                    <button type="button" id="quickTest" class="btn-secondary" 
                            style="padding: 8px 16px; font-size: 12px;">
                        빠른 알림 테스트
                    </button>
                </div>
                <small style="color: #666; display: block;">
                    알람이 보이지 않는 문제를 진단합니다.
                </small>
            `;

            const modalBody = settingsModal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.appendChild(diagnosticsSection);
            }

            // 이벤트 리스너 추가
            document.getElementById('runDiagnostics').addEventListener('click', () => {
                window.notificationDiagnostics.runFullDiagnostics();
            });

            document.getElementById('quickTest').addEventListener('click', () => {
                if (Notification.permission === 'granted') {
                    new Notification('빠른 테스트', {
                        body: '이 알림이 보이면 기본 설정이 정상입니다!',
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="24" font-size="24">⚡</text></svg>',
                        tag: 'quick_test'
                    });
                } else {
                    alert('알림 권한이 필요합니다. 먼저 "전체 진단 실행"을 클릭해 권한을 허용해주세요.');
                }
            });
        }

        console.log('✅ 알림 진단 시스템이 로드되었습니다.');
        console.log('🔍 사용법: window.notificationDiagnostics.runFullDiagnostics()');
    }, 1500);

    // 전역 접근용
    window.runNotificationDiagnostics = () => window.notificationDiagnostics.runFullDiagnostics();

})();