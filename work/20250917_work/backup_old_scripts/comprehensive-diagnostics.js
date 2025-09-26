// 포괄적 진단 및 문제 자동 감지 시스템

(function() {
    'use strict';
    
    console.log('🔍 포괄적 진단 시스템 로드됨');
    
    // 진단 데이터 수집
    const DiagnosticSystem = {
        issues: [],
        warnings: [],
        performance: {},
        interactions: [],
        startTime: Date.now(),
        
        // 문제 감지 및 로그
        detectIssue: function(category, message, details = {}) {
            const issue = {
                timestamp: new Date().toLocaleTimeString(),
                category,
                message,
                details,
                severity: details.severity || 'warning'
            };
            
            if (details.severity === 'error') {
                this.issues.push(issue);
                console.error(`🚨 [${category}] ${message}`, details);
            } else {
                this.warnings.push(issue);
                console.warn(`⚠️ [${category}] ${message}`, details);
            }
            
            // 중요한 문제는 즉시 알림
            if (details.severity === 'critical') {
                this.showCriticalAlert(issue);
            }
        },
        
        // 사용자 상호작용 추적
        trackInteraction: function(action, element, success = true, duration = 0) {
            const interaction = {
                timestamp: new Date().toLocaleTimeString(),
                action,
                element: element || 'unknown',
                success,
                duration,
                url: window.location.href
            };
            
            this.interactions.push(interaction);
            
            if (!success) {
                this.detectIssue('USER_INTERACTION', `${action} 실패`, {
                    element,
                    duration,
                    severity: 'error'
                });
            }
            
            console.log(`👤 [상호작용] ${action} ${success ? '성공' : '실패'} (${duration}ms)`, {
                element,
                timestamp: interaction.timestamp
            });
        },
        
        // 성능 모니터링
        measurePerformance: function(name, startTime, endTime = Date.now()) {
            const duration = endTime - startTime;
            this.performance[name] = duration;
            
            let status = '✅';
            let severity = 'info';
            
            if (duration > 1000) {
                status = '🐌';
                severity = 'warning';
                this.detectIssue('PERFORMANCE', `${name} 느린 실행`, {
                    duration: `${duration}ms`,
                    severity
                });
            } else if (duration > 3000) {
                status = '🚨';
                severity = 'error';
            }
            
            console.log(`${status} [성능] ${name}: ${duration}ms`);
            return duration;
        },
        
        // DOM 상태 검사
        checkDOMHealth: function() {
            const checks = {
                modalCount: document.querySelectorAll('.modal, .memo-modal').length,
                lockButtons: document.querySelectorAll('.memo-lock-toggle').length,
                memoLists: document.querySelectorAll('#memoList, #stickyMemoList, #dateMemoList').length,
                hiddenElements: document.querySelectorAll('[style*="display: none"]').length,
                duplicateIds: this.findDuplicateIds()
            };
            
            console.log('🏥 [DOM 건강 검사]', checks);
            
            // 문제 감지
            if (checks.duplicateIds.length > 0) {
                this.detectIssue('DOM_HEALTH', '중복 ID 발견', {
                    duplicateIds: checks.duplicateIds,
                    severity: 'error'
                });
            }
            
            if (checks.lockButtons === 0) {
                this.detectIssue('DOM_HEALTH', '잠금 버튼을 찾을 수 없음', {
                    severity: 'warning'
                });
            }
            
            return checks;
        },
        
        // 중복 ID 찾기
        findDuplicateIds: function() {
            const ids = {};
            const duplicates = [];
            
            document.querySelectorAll('[id]').forEach(element => {
                const id = element.id;
                if (ids[id]) {
                    duplicates.push(id);
                } else {
                    ids[id] = true;
                }
            });
            
            return duplicates;
        },
        
        // 메모리 사용량 검사
        checkMemoryUsage: function() {
            if (performance.memory) {
                const memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                console.log('🧠 [메모리 사용량]', `${memory.used}MB / ${memory.total}MB (한계: ${memory.limit}MB)`);
                
                if (memory.used / memory.limit > 0.8) {
                    this.detectIssue('MEMORY', '메모리 사용량 높음', {
                        usage: memory,
                        severity: 'warning'
                    });
                }
                
                return memory;
            }
            return null;
        },
        
        // 메모 데이터 일관성 검사
        checkMemoDataIntegrity: function() {
            try {
                const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                const now = Date.now();
                const oneMinuteAgo = now - (60 * 1000);
                
                // 최근 1분 내 추가된 메모가 있는지 확인
                let recentlyAddedCount = 0;
                let recentlyRestoredCount = 0;
                
                memos.forEach(memo => {
                    if (memo.id && memo.createdAt) {
                        const createdTime = new Date(memo.createdAt).getTime();
                        if (createdTime > oneMinuteAgo) {
                            recentlyAddedCount++;
                            
                            // 메모 내용에 복원 관련 키워드가 있는지 확인
                            const content = (memo.content || memo.title || '').toLowerCase();
                            if (content.includes('복원') || content.includes('restore') || memo.isRestored) {
                                recentlyRestoredCount++;
                            }
                        }
                    }
                });
                
                const integrity = {
                    totalMemos: memos.length,
                    recentlyAdded: recentlyAddedCount,
                    possibleRestored: recentlyRestoredCount,
                    lastCheck: new Date().toLocaleTimeString()
                };
                
                console.log('🔍 [메모 데이터 일관성]', integrity);
                
                // 대량의 메모가 갑자기 추가된 경우 (복원 의심)
                if (recentlyAddedCount > 3) {
                    this.detectIssue('DATA_INTEGRITY', '대량 메모 추가 감지', {
                        count: recentlyAddedCount,
                        possibleRestore: recentlyRestoredCount > 0,
                        severity: 'warning'
                    });
                }
                
                // 복원된 메모가 감지된 경우
                if (recentlyRestoredCount > 0) {
                    this.detectIssue('DATA_INTEGRITY', '복원된 메모 감지', {
                        restoredCount: recentlyRestoredCount,
                        severity: 'critical'
                    });
                }
                
                return integrity;
            } catch (error) {
                this.detectIssue('DATA_INTEGRITY', '메모 데이터 검사 오류', {
                    error: error.message,
                    severity: 'error'
                });
                return null;
            }
        },
        
        // 자동 동기화 시스템 상태 검사
        checkAutoSyncStatus: function() {
            try {
                const autoSyncEnabled = JSON.parse(localStorage.getItem('autoSyncEnabled') || 'false');
                const lastSyncTime = parseInt(localStorage.getItem('lastSyncTime') || '0');
                const isCurrentlySyncing = window.isCurrentlySyncing || false;
                
                const syncStatus = {
                    enabled: autoSyncEnabled,
                    lastSync: lastSyncTime ? new Date(lastSyncTime).toLocaleString() : '없음',
                    syncing: isCurrentlySyncing,
                    hasRestoreFunction: typeof window.restoreFromCloud === 'function',
                    timeSinceLastSync: lastSyncTime ? Date.now() - lastSyncTime : null
                };
                
                console.log('☁️ [자동 동기화 상태]', syncStatus);
                
                // 자동 동기화가 활성화되어 있고 복원 기능이 있는 경우 경고
                if (autoSyncEnabled && syncStatus.hasRestoreFunction) {
                    this.detectIssue('AUTO_SYNC', '자동 동기화와 복원 기능 모두 활성화됨', {
                        note: '삭제된 메모가 자동으로 복원될 수 있음',
                        severity: 'warning'
                    });
                }
                
                // 현재 동기화 중인 경우
                if (isCurrentlySyncing) {
                    this.detectIssue('AUTO_SYNC', '동기화 진행 중', {
                        note: '데이터 변경 사항이 클라우드와 동기화되고 있음',
                        severity: 'info'
                    });
                }
                
                return syncStatus;
            } catch (error) {
                this.detectIssue('AUTO_SYNC', '동기화 상태 검사 오류', {
                    error: error.message,
                    severity: 'error'
                });
                return null;
            }
        },
        
        // 이벤트 리스너 누수 검사
        checkEventListeners: function() {
            const listeners = {
                click: document.querySelectorAll('[onclick], *').length,
                buttons: document.querySelectorAll('button').length,
                modals: document.querySelectorAll('.modal, .memo-modal').length
            };
            
            console.log('👂 [이벤트 리스너]', listeners);
            return listeners;
        },
        
        // 로컬스토리지 상태 검사
        checkLocalStorage: function() {
            try {
                const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
                
                const storage = {
                    memoCount: memos.length,
                    storageUsed: new Blob([JSON.stringify(localStorage)]).size,
                    hasMemos: memos.length > 0,
                    hasSettings: Object.keys(settings).length > 0
                };
                
                console.log('💾 [로컬스토리지]', storage);
                return storage;
            } catch (error) {
                this.detectIssue('STORAGE', '로컬스토리지 읽기 오류', {
                    error: error.message,
                    severity: 'error'
                });
                return null;
            }
        },
        
        // 중요한 문제 알림
        showCriticalAlert: function(issue) {
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff4444;
                color: white;
                padding: 15px;
                border-radius: 8px;
                z-index: 999999;
                font-weight: bold;
                max-width: 300px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            `;
            alertDiv.textContent = `🚨 중요: ${issue.message}`;
            
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 5000);
        },
        
        // 전체 진단 실행
        runFullDiagnostics: function() {
            console.log('🔍 전체 진단 시작...');
            
            const results = {
                timestamp: new Date().toLocaleString(),
                dom: this.checkDOMHealth(),
                memory: this.checkMemoryUsage(),
                storage: this.checkLocalStorage(),
                listeners: this.checkEventListeners(),
                dataIntegrity: this.checkMemoDataIntegrity(),
                autoSync: this.checkAutoSyncStatus(),
                issues: this.issues,
                warnings: this.warnings,
                interactions: this.interactions.slice(-10), // 최근 10개
                performance: this.performance
            };
            
            console.log('📊 [전체 진단 결과]', results);
            
            // 요약 출력
            console.log(`
🏥 진단 요약:
- 🚨 심각한 문제: ${this.issues.length}개
- ⚠️ 경고: ${this.warnings.length}개  
- 👤 상호작용: ${this.interactions.length}개
- 💾 메모 개수: ${results.storage?.memoCount || 0}개
- 🧠 메모리 사용: ${results.memory?.used || 'N/A'}MB
- 🏠 DOM 상태: ${results.dom.lockButtons}개 잠금버튼, ${results.dom.modalCount}개 모달
- 🔍 데이터 일관성: ${results.dataIntegrity?.totalMemos || 0}개 메모, 최근 추가 ${results.dataIntegrity?.recentlyAdded || 0}개
- ☁️ 자동 동기화: ${results.autoSync?.enabled ? '활성화' : '비활성화'}, 복원기능 ${results.autoSync?.hasRestoreFunction ? '있음' : '없음'}
            `);
            
            return results;
        },
        
        // 자동 모니터링 시작
        startAutoMonitoring: function() {
            console.log('🤖 자동 모니터링 시작');
            
            // 5초마다 기본 검사
            setInterval(() => {
                this.checkDOMHealth();
                this.checkMemoryUsage();
            }, 5000);
            
            // 30초마다 전체 진단
            setInterval(() => {
                this.runFullDiagnostics();
            }, 30000);
            
            // 사용자 상호작용 자동 추적
            this.setupInteractionTracking();
        },
        
        // 상호작용 추적 설정
        setupInteractionTracking: function() {
            // 클릭 이벤트 추적
            document.addEventListener('click', (e) => {
                const element = e.target.tagName + (e.target.id ? `#${e.target.id}` : '') + (e.target.className ? `.${e.target.className.split(' ')[0]}` : '');
                this.trackInteraction('CLICK', element, true, 0);
            });
            
            // 에러 자동 캐치
            window.addEventListener('error', (e) => {
                this.detectIssue('JAVASCRIPT_ERROR', e.message, {
                    filename: e.filename,
                    line: e.lineno,
                    column: e.colno,
                    stack: e.error?.stack,
                    severity: 'error'
                });
            });
            
            // 언핸들드 프로미스 거부
            window.addEventListener('unhandledrejection', (e) => {
                this.detectIssue('PROMISE_REJECTION', e.reason, {
                    severity: 'error'
                });
            });
        }
    };
    
    // 전역으로 노출
    window.DiagnosticSystem = DiagnosticSystem;
    
    // 자동 시작
    DiagnosticSystem.startAutoMonitoring();
    
    // 초기 진단
    setTimeout(() => {
        DiagnosticSystem.runFullDiagnostics();
    }, 1000);
    
    console.log('✅ 포괄적 진단 시스템 초기화 완료');
    console.log('🛠️ 사용법: DiagnosticSystem.runFullDiagnostics()');
    
})();