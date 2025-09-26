// 메모 삭제 추적 및 복원 방지 시스템
(function() {
    'use strict';
    
    console.log('🗑️ 메모 삭제 추적 시스템 로드됨');
    
    // 삭제된 메모들을 추적하는 시스템
    const MemoDeletionTracker = {
        deletedMemoIds: new Set(),
        deletionLog: [],
        
        // 삭제된 메모 기록
        trackDeletion: function(memoId, memo) {
            if (!memoId) return;
            
            const deletionRecord = {
                id: memoId,
                title: memo?.title || '제목 없음',
                deletedAt: new Date().toISOString(),
                timestamp: Date.now(),
                content: memo?.content || '',
                preventRestore: true
            };
            
            this.deletedMemoIds.add(memoId);
            this.deletionLog.push(deletionRecord);
            
            // 로컬스토리지에 삭제 기록 저장 (최대 100개)
            const maxLogs = 100;
            if (this.deletionLog.length > maxLogs) {
                this.deletionLog = this.deletionLog.slice(-maxLogs);
            }
            
            this.saveToLocalStorage();
            
            console.log('🗑️ [삭제 추적] 메모 삭제 기록됨:', {
                id: memoId,
                title: deletionRecord.title,
                time: deletionRecord.deletedAt
            });
            
            // 진단 시스템에 알림
            if (window.DiagnosticSystem) {
                window.DiagnosticSystem.trackInteraction('MEMO_DELETED', `memo-${memoId}`, true, 0);
                window.DiagnosticSystem.detectIssue('MEMO_LIFECYCLE', '메모 삭제됨', {
                    memoId,
                    title: deletionRecord.title,
                    severity: 'info'
                });
            }
        },
        
        // 삭제된 메모인지 확인
        isDeleted: function(memoId) {
            return this.deletedMemoIds.has(memoId);
        },
        
        // 복원 시도 방지
        preventRestore: function(memoId, reason = '사용자가 삭제한 메모') {
            if (this.isDeleted(memoId)) {
                console.warn('🚫 [복원 방지] 삭제된 메모 복원 시도 차단:', {
                    id: memoId,
                    reason
                });
                
                // 진단 시스템에 경고
                if (window.DiagnosticSystem) {
                    window.DiagnosticSystem.detectIssue('MEMO_LIFECYCLE', '삭제된 메모 복원 시도 차단', {
                        memoId,
                        reason,
                        severity: 'warning'
                    });
                }
                
                // 사용자에게 알림
                this.showRestorePreventionNotice(memoId);
                
                return true;
            }
            return false;
        },
        
        // 복원 방지 알림
        showRestorePreventionNotice: function(memoId) {
            const deletionRecord = this.deletionLog.find(log => log.id === memoId);
            if (!deletionRecord) return;
            
            const noticeDiv = document.createElement('div');
            noticeDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff9800;
                color: white;
                padding: 15px;
                border-radius: 8px;
                z-index: 999999;
                font-weight: bold;
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                border-left: 4px solid #f57c00;
            `;
            
            noticeDiv.innerHTML = `
                🚫 <strong>복원 차단됨</strong><br>
                <div style="font-size: 13px; margin-top: 5px; font-weight: normal;">
                    메모: "${deletionRecord.title}"<br>
                    삭제 시간: ${new Date(deletionRecord.deletedAt).toLocaleString()}<br>
                    <small style="opacity: 0.9;">사용자가 삭제한 메모는 자동 복원되지 않습니다.</small>
                </div>
            `;
            
            document.body.appendChild(noticeDiv);
            
            setTimeout(() => {
                if (noticeDiv.parentNode) {
                    noticeDiv.parentNode.removeChild(noticeDiv);
                }
            }, 8000);
        },
        
        // 로컬스토리지에 저장
        saveToLocalStorage: function() {
            try {
                localStorage.setItem('deletedMemoIds', JSON.stringify([...this.deletedMemoIds]));
                localStorage.setItem('memoDeletionLog', JSON.stringify(this.deletionLog));
            } catch (error) {
                console.error('삭제 기록 저장 실패:', error);
            }
        },
        
        // 로컬스토리지에서 로드
        loadFromLocalStorage: function() {
            try {
                const deletedIds = JSON.parse(localStorage.getItem('deletedMemoIds') || '[]');
                const deletionLog = JSON.parse(localStorage.getItem('memoDeletionLog') || '[]');
                
                this.deletedMemoIds = new Set(deletedIds);
                this.deletionLog = deletionLog;
                
                console.log(`🔄 삭제 기록 로드됨: ${deletedIds.length}개 ID, ${deletionLog.length}개 로그`);
            } catch (error) {
                console.error('삭제 기록 로드 실패:', error);
                this.deletedMemoIds = new Set();
                this.deletionLog = [];
            }
        },
        
        // 오래된 삭제 기록 정리 (30일 이상)
        cleanupOldRecords: function() {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const oldLogCount = this.deletionLog.length;
            
            // 오래된 로그 제거
            this.deletionLog = this.deletionLog.filter(log => log.timestamp > thirtyDaysAgo);
            
            // 로그에 없는 ID들을 Set에서 제거
            const activeIds = new Set(this.deletionLog.map(log => log.id));
            this.deletedMemoIds = new Set([...this.deletedMemoIds].filter(id => activeIds.has(id)));
            
            const cleanedCount = oldLogCount - this.deletionLog.length;
            if (cleanedCount > 0) {
                console.log(`🧹 오래된 삭제 기록 정리됨: ${cleanedCount}개`);
                this.saveToLocalStorage();
            }
        },
        
        // 삭제 통계 확인
        getDeletionStats: function() {
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
            
            const stats = {
                total: this.deletionLog.length,
                today: this.deletionLog.filter(log => log.timestamp > oneDayAgo).length,
                thisWeek: this.deletionLog.filter(log => log.timestamp > oneWeekAgo).length,
                trackedIds: this.deletedMemoIds.size,
                oldestRecord: this.deletionLog.length > 0 ? 
                    new Date(Math.min(...this.deletionLog.map(log => log.timestamp))).toLocaleString() : null
            };
            
            console.log('📊 [삭제 통계]', stats);
            return stats;
        },
        
        // 현재 상태 테스트
        testRestorationPrevention: function() {
            console.log('🧪 [복원 방지 테스트] 시작...');
            
            // 현재 메모 상태
            const currentMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const deletedIds = [...this.deletedMemoIds];
            
            console.log('📋 현재 메모:', currentMemos.length + '개');
            console.log('🗑️ 삭제된 ID:', deletedIds.length + '개', deletedIds);
            
            // 복원된 메모 찾기
            const restoredMemos = currentMemos.filter(memo => this.isDeleted(memo.id));
            
            if (restoredMemos.length > 0) {
                console.error('🚨 복원된 메모 발견!', restoredMemos.length + '개:');
                restoredMemos.forEach((memo, i) => {
                    console.error(`   ${i+1}. "${memo.title}" (ID: ${memo.id})`);
                });
                
                // 즉시 정리
                const cleanedMemos = currentMemos.filter(memo => !this.isDeleted(memo.id));
                localStorage.setItem('calendarMemos', JSON.stringify(cleanedMemos));
                console.log('🧹 복원된 메모 즉시 정리 완료:', currentMemos.length + '개 → ' + cleanedMemos.length + '개');
                
                return {
                    issue: true,
                    restoredCount: restoredMemos.length,
                    cleaned: true
                };
            } else {
                console.log('✅ 복원 방지 정상 작동 - 삭제된 메모 없음');
                return {
                    issue: false,
                    restoredCount: 0,
                    cleaned: false
                };
            }
        },
        
        // 강제 정리
        forceCleanup: function() {
            console.log('🧹 [강제 정리] 시작...');
            
            // localStorage에서 직접 raw 데이터 가져오기
            const rawData = originalGetItem.call(localStorage, 'calendarMemos');
            const memos = JSON.parse(rawData || '[]');
            const beforeCount = memos.length;
            const cleanedMemos = memos.filter(memo => !this.isDeleted(memo.id));
            const afterCount = cleanedMemos.length;
            
            if (beforeCount !== afterCount) {
                // 직접 raw 데이터로 저장
                originalSetItem.call(localStorage, 'calendarMemos', JSON.stringify(cleanedMemos));
                console.log(`🧹 강제 정리 완료: ${beforeCount}개 → ${afterCount}개`);
                
                // UI 새로고침
                if (window.loadMemos) window.loadMemos();
                if (window.displayStickyMemos) window.displayStickyMemos();
                if (window.displayDateMemos) window.displayDateMemos();
                if (window.updateCalendarDisplay) window.updateCalendarDisplay();
                
                console.log('🔄 UI 새로고침 완료');
            } else {
                console.log('✅ 정리할 내용 없음 - 상태 정상');
            }
            
            return {
                before: beforeCount,
                after: afterCount,
                cleaned: beforeCount - afterCount
            };
        },
        
        // Raw localStorage 데이터 직접 확인
        checkRawData: function() {
            console.log('🔍 [Raw 데이터 확인] 시작...');
            
            const rawData = originalGetItem.call(localStorage, 'calendarMemos');
            const filteredData = localStorage.getItem('calendarMemos'); // 필터링된 데이터
            
            const rawMemos = JSON.parse(rawData || '[]');
            const filteredMemos = JSON.parse(filteredData || '[]');
            
            console.log('📊 Raw 데이터:', rawMemos.length + '개');
            console.log('📊 필터링된 데이터:', filteredMemos.length + '개');
            
            const deletedInRaw = rawMemos.filter(memo => this.isDeleted(memo.id));
            if (deletedInRaw.length > 0) {
                console.error('🚨 Raw 데이터에 삭제된 메모 발견:', deletedInRaw.length + '개');
                deletedInRaw.forEach((memo, i) => {
                    console.error(`   ${i+1}. "${memo.title}" (ID: ${memo.id})`);
                });
                
                return {
                    issue: true,
                    rawCount: rawMemos.length,
                    filteredCount: filteredMemos.length,
                    deletedInRaw: deletedInRaw.length
                };
            } else {
                console.log('✅ Raw 데이터 정상 - 삭제된 메모 없음');
                return {
                    issue: false,
                    rawCount: rawMemos.length,
                    filteredCount: filteredMemos.length,
                    deletedInRaw: 0
                };
            }
        }
    };
    
    // 기존 삭제 함수들을 가로채서 추적 기능 추가
    function wrapDeletionFunction(funcName) {
        const originalFunc = window[funcName];
        if (typeof originalFunc === 'function') {
            window[funcName] = function(id, ...args) {
                // 삭제 전에 메모 정보 수집
                let memo = null;
                try {
                    const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                    memo = memos.find(m => m.id === id);
                } catch (error) {
                    console.warn('메모 정보 수집 실패:', error);
                }
                
                // 삭제 추적
                MemoDeletionTracker.trackDeletion(id, memo);
                
                // 원본 함수 실행
                return originalFunc.apply(this, [id, ...args]);
            };
            
            console.log(`🔗 삭제 함수 래핑 완료: ${funcName}`);
        }
    }
    
    // localStorage.getItem을 더 강력하게 가로채기
    const originalGetItem = localStorage.getItem;
    const interceptGetItem = function(key) {
        const result = originalGetItem.call(localStorage, key);
        
        // calendarMemos 키에 대해서만 필터링
        if (key === 'calendarMemos' && result && result !== 'null' && result !== '') {
            try {
                const memos = JSON.parse(result);
                if (Array.isArray(memos) && memos.length > 0) {
                    const filteredMemos = memos.filter(memo => {
                        if (memo && memo.id && MemoDeletionTracker.isDeleted(memo.id)) {
                            console.warn(`🚫 [getItem 차단] 삭제된 메모 "${memo.title || '제목없음'}" (ID: ${memo.id}) 제외`);
                            return false;
                        }
                        return true;
                    });
                    
                    if (filteredMemos.length !== memos.length) {
                        const blockedCount = memos.length - filteredMemos.length;
                        console.warn(`🚫 [getItem 필터링] ${blockedCount}개 삭제된 메모 차단됨`);
                        return JSON.stringify(filteredMemos);
                    }
                }
            } catch (error) {
                console.warn('🚫 getItem 필터링 중 오류:', error, 'key:', key, 'result:', result);
            }
        }
        
        return result;
    };
    
    // 여러 방법으로 localStorage.getItem 덮어쓰기
    try {
        // 방법 1: 직접 할당
        localStorage.getItem = interceptGetItem;
        
        // 방법 2: defineProperty로 강제 설정
        Object.defineProperty(localStorage, 'getItem', {
            value: interceptGetItem,
            writable: true,
            configurable: true
        });
        
        // 방법 3: Storage 프로토타입 수정
        if (typeof Storage !== 'undefined' && Storage.prototype) {
            Storage.prototype.getItem = interceptGetItem;
        }
        
        console.log('✅ localStorage.getItem 가로채기 완료 (다중 방법 적용)');
    } catch (error) {
        console.error('❌ localStorage.getItem 가로채기 실패:', error);
    }
    
    // localStorage.setItem을 가로채서 복원 방지 - 개선된 버전
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        if (key === 'calendarMemos') {
            try {
                const newData = JSON.parse(value);
                
                // 객체 형식 (날짜별 구조) 처리
                if (newData && typeof newData === 'object' && !Array.isArray(newData)) {
                    let hasRestoredMemos = false;
                    const cleanedData = {};
                    let totalOriginal = 0;
                    let totalCleaned = 0;
                    
                    Object.keys(newData).forEach(dateKey => {
                        if (Array.isArray(newData[dateKey])) {
                            const originalMemos = newData[dateKey];
                            totalOriginal += originalMemos.length;
                            
                            const cleanedMemos = originalMemos.filter(memo => {
                                if (memo && memo.id && MemoDeletionTracker.isDeleted(memo.id)) {
                                    console.warn(`🚨 삭제된 메모 복원 시도 차단: "${memo.title || '제목없음'}" (ID: ${memo.id})`);
                                    hasRestoredMemos = true;
                                    return false;
                                }
                                return true;
                            });
                            
                            totalCleaned += cleanedMemos.length;
                            cleanedData[dateKey] = cleanedMemos;
                        } else {
                            cleanedData[dateKey] = newData[dateKey];
                        }
                    });
                    
                    if (hasRestoredMemos) {
                        value = JSON.stringify(cleanedData);
                        console.log(`🧹 [복원 방지] ${totalOriginal}개 → ${totalCleaned}개 메모로 저장`);
                    }
                }
                // 배열 형식 처리 (이전 방식 호환)
                else if (Array.isArray(newData)) {
                    const originalCount = newData.length;
                    const restoredMemos = [];
                    
                    // 삭제된 메모들을 필터링
                    const filteredMemos = newData.filter(memo => {
                        const isDeleted = MemoDeletionTracker.isDeleted(memo.id);
                        if (isDeleted) {
                            restoredMemos.push({
                                id: memo.id,
                                title: memo.title || '제목 없음'
                            });
                            MemoDeletionTracker.preventRestore(memo.id, 'localStorage 저장 시 복원 시도');
                        }
                        return !isDeleted;
                    });
                    
                    if (restoredMemos.length > 0) {
                        console.warn(`🚫 [복원 방지] ${restoredMemos.length}개 삭제된 메모 복원 시도 감지`);
                        value = JSON.stringify(filteredMemos);
                        console.log(`🔧 [복원 방지] ${originalCount}개 → ${filteredMemos.length}개 메모로 저장`);
                        
                        // 진단 시스템에 경고
                        if (window.DiagnosticSystem) {
                            window.DiagnosticSystem.detectIssue('MEMO_RESTORATION_BLOCKED', '삭제된 메모 복원 차단', {
                                blockedCount: restoredMemos.length,
                                blockedMemos: restoredMemos.map(m => m.title),
                                severity: 'critical'
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn('메모 복원 방지 처리 중 오류:', error);
            }
        }
        
        return originalSetItem.apply(this, arguments);
    };
    
    // 초기화
    MemoDeletionTracker.loadFromLocalStorage();
    MemoDeletionTracker.cleanupOldRecords();
    
    // 메모 저장 함수들을 래핑하여 복원 방지
    function wrapSaveFunction(funcName) {
        const originalFunc = window[funcName];
        if (typeof originalFunc === 'function') {
            window[funcName] = function(...args) {
                console.log(`🛡️ [저장 함수 래핑] ${funcName} 호출됨`);
                
                // 원본 함수 실행 전에 현재 localStorage 데이터 확인
                const currentMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                const beforeCount = currentMemos.length;
                
                // 원본 함수 실행
                const result = originalFunc.apply(this, args);
                
                // 실행 후 결과 확인
                setTimeout(() => {
                    const afterMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                    const afterCount = afterMemos.length;
                    const restoredMemos = afterMemos.filter(memo => MemoDeletionTracker.isDeleted(memo.id));
                    
                    if (restoredMemos.length > 0) {
                        console.error(`🚨 [${funcName}] 삭제된 메모 ${restoredMemos.length}개가 복원됨! 즉시 제거`);
                        const cleanedMemos = afterMemos.filter(memo => !MemoDeletionTracker.isDeleted(memo.id));
                        localStorage.setItem('calendarMemos', JSON.stringify(cleanedMemos));
                        console.log(`🧹 [${funcName}] 정리 완료: ${afterCount}개 → ${cleanedMemos.length}개`);
                    } else {
                        console.log(`✅ [${funcName}] 저장 완료: ${beforeCount}개 → ${afterCount}개, 복원 없음`);
                    }
                }, 50);
                
                return result;
            };
            
            console.log(`🔗 저장 함수 래핑 완료: ${funcName}`);
        }
    }
    
    // 주요 삭제 함수들 래핑
    setTimeout(() => {
        wrapDeletionFunction('deleteMemo');
        wrapDeletionFunction('deleteMemoFromList');
        wrapDeletionFunction('deleteMemoFromDetail');
        wrapDeletionFunction('deleteDateMemo');
        
        // 저장 함수들 래핑
        wrapSaveFunction('saveDateMemo');
        wrapSaveFunction('saveMemo');
        wrapSaveFunction('addMemo');
        
        // JSON.parse 함수도 래핑하여 메모 로드 시 필터링
        wrapJSONParse();
    }, 100);
    
    // JSON.parse를 가로채서 메모 데이터 필터링
    function wrapJSONParse() {
        const originalJSONParse = JSON.parse;
        JSON.parse = function(text, reviver) {
            try {
                const result = originalJSONParse.call(this, text, reviver);
                
                // 메모 배열인지 확인 (calendarMemos 구조 감지)
                if (Array.isArray(result) && result.length > 0 && result[0] && result[0].id && result[0].title) {
                    const filteredResult = result.filter(memo => {
                        if (memo.id && MemoDeletionTracker.isDeleted(memo.id)) {
                            console.warn(`🚫 [JSON.parse 차단] 삭제된 메모 "${memo.title}" (ID: ${memo.id}) 제외`);
                            return false;
                        }
                        return true;
                    });
                    
                    if (filteredResult.length !== result.length) {
                        const blockedCount = result.length - filteredResult.length;
                        console.warn(`🚫 [JSON.parse 필터링] ${blockedCount}개 삭제된 메모 차단됨`);
                        return filteredResult;
                    }
                }
                
                return result;
            } catch (error) {
                return originalJSONParse.call(this, text, reviver);
            }
        };
        
        console.log('🔗 JSON.parse 래핑 완료 (메모 데이터 필터링)');
    }
    
    // 전역으로 노출
    window.MemoDeletionTracker = MemoDeletionTracker;
    
    // 주기적 정리 (30분마다)
    setInterval(() => {
        MemoDeletionTracker.cleanupOldRecords();
    }, 30 * 60 * 1000);
    
    console.log('✅ 메모 삭제 추적 시스템 초기화 완료');
    console.log('🛠️ 사용법:');
    console.log('  - MemoDeletionTracker.getDeletionStats() : 삭제 통계');
    console.log('  - MemoDeletionTracker.testRestorationPrevention() : 복원 방지 테스트');
    console.log('  - MemoDeletionTracker.forceCleanup() : 강제 정리');
    console.log('  - MemoDeletionTracker.checkRawData() : Raw 데이터 확인');
    
    // 초기 테스트 실행
    setTimeout(() => {
        MemoDeletionTracker.testRestorationPrevention();
    }, 1000);
    
})();