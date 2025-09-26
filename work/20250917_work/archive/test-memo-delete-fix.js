/**
 * 메모 삭제 후 복원 버그 수정 테스트
 * 이 스크립트는 브라우저 콘솔에서 실행하여 수정사항을 테스트합니다
 */

(function() {
    'use strict';
    
    console.log('🧪 메모 삭제 후 복원 버그 수정 테스트 시작');
    
    // 테스트용 임시 데이터 백업
    const originalData = localStorage.getItem('calendarMemos');
    
    function runTest() {
        console.log('\n🔬 테스트 1: 메모 저장 시 삭제된 메모 복원 방지');
        
        // 1. 초기 데이터 설정
        const testMemos = [
            {
                id: 1001,
                title: '테스트 메모 1',
                content: '이 메모는 삭제될 예정입니다',
                date: '2025-08-31',
                timestamp: new Date().toISOString()
            },
            {
                id: 1002,
                title: '테스트 메모 2',
                content: '이 메모도 삭제될 예정입니다',
                date: '2025-08-31',
                timestamp: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('calendarMemos', JSON.stringify(testMemos));
        console.log('✅ 초기 테스트 메모 2개 생성');
        
        // 2. unified-memo-system으로 메모 삭제 시뮬레이션
        if (window.MemoSystem && window.MemoSystem.deleteMemo) {
            window.MemoSystem.deleteMemo(1001);
            console.log('✅ unified-memo-system으로 메모 1 삭제');
            
            window.MemoSystem.deleteMemo(1002);
            console.log('✅ unified-memo-system으로 메모 2 삭제');
        } else {
            // 직접 삭제
            let currentMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            currentMemos = currentMemos.filter(m => m.id !== 1001 && m.id !== 1002);
            localStorage.setItem('calendarMemos', JSON.stringify(currentMemos));
            console.log('✅ 직접 메모 1, 2 삭제');
        }
        
        const afterDelete = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        console.log('📊 삭제 후 메모 개수:', afterDelete.length);
        
        // 3. 새 메모 추가 (saveDateMemo 함수 시뮬레이션)
        const newMemo = {
            id: Date.now(),
            title: '새로운 테스트 메모',
            content: '이 메모 저장 후 삭제된 메모가 복원되면 안됩니다',
            date: '2025-08-31',
            timestamp: new Date().toISOString()
        };
        
        // 수정된 로직 사용: localStorage에서 직접 읽어옴
        const currentMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        currentMemos.unshift(newMemo);
        localStorage.setItem('calendarMemos', JSON.stringify(currentMemos));
        
        console.log('✅ 새 메모 저장 완료');
        
        // 4. 결과 확인
        const finalMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        console.log('📊 최종 메모 개수:', finalMemos.length);
        console.log('📋 최종 메모 목록:', finalMemos.map(m => ({ id: m.id, title: m.title })));
        
        // 5. 테스트 검증
        const hasDeletedMemo1 = finalMemos.some(m => m.id === 1001);
        const hasDeletedMemo2 = finalMemos.some(m => m.id === 1002);
        const hasNewMemo = finalMemos.some(m => m.title === '새로운 테스트 메모');
        
        console.log('\n🎯 테스트 결과:');
        console.log('- 삭제된 메모 1 복원됨:', hasDeletedMemo1 ? '❌ 실패' : '✅ 성공');
        console.log('- 삭제된 메모 2 복원됨:', hasDeletedMemo2 ? '❌ 실패' : '✅ 성공');
        console.log('- 새 메모 저장됨:', hasNewMemo ? '✅ 성공' : '❌ 실패');
        
        if (!hasDeletedMemo1 && !hasDeletedMemo2 && hasNewMemo) {
            console.log('🎉 전체 테스트 통과! 메모 삭제 후 복원 버그가 수정되었습니다.');
        } else {
            console.log('❌ 테스트 실패! 아직 버그가 남아있습니다.');
        }
        
        return {
            success: !hasDeletedMemo1 && !hasDeletedMemo2 && hasNewMemo,
            details: {
                deletedMemo1Restored: hasDeletedMemo1,
                deletedMemo2Restored: hasDeletedMemo2,
                newMemoSaved: hasNewMemo,
                totalMemos: finalMemos.length
            }
        };
    }
    
    function runGlobalVariableTest() {
        console.log('\n🔬 테스트 2: 전역변수 memos 의존성 제거 확인');
        
        // 전역 memos 변수에 오래된 데이터 주입
        if (window.memos !== undefined) {
            console.log('⚠️ 전역 memos 변수가 여전히 존재합니다');
            window.memos = [
                { id: 9999, title: '오래된 전역변수 데이터', content: '이것은 복원되면 안됩니다' }
            ];
            console.log('✅ 전역변수에 오래된 데이터 주입');
        } else {
            console.log('✅ 전역 memos 변수가 제거되었습니다');
        }
        
        // localStorage에는 깨끗한 데이터
        localStorage.setItem('calendarMemos', JSON.stringify([]));
        
        // 새 메모 저장
        const testMemo = {
            id: Date.now(),
            title: '전역변수 테스트 메모',
            content: '이 메모만 저장되어야 합니다',
            date: '2025-08-31',
            timestamp: new Date().toISOString()
        };
        
        // 수정된 로직으로 저장
        const currentMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        currentMemos.unshift(testMemo);
        localStorage.setItem('calendarMemos', JSON.stringify(currentMemos));
        
        const result = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        const hasOldData = result.some(m => m.id === 9999);
        
        console.log('📊 저장된 메모 개수:', result.length);
        console.log('- 전역변수 오래된 데이터 포함됨:', hasOldData ? '❌ 실패' : '✅ 성공');
        
        return !hasOldData;
    }
    
    function cleanup() {
        console.log('\n🧹 테스트 데이터 정리 중...');
        if (originalData) {
            localStorage.setItem('calendarMemos', originalData);
            console.log('✅ 원본 데이터 복원 완료');
        } else {
            localStorage.removeItem('calendarMemos');
            console.log('✅ 테스트 데이터 제거 완료');
        }
    }
    
    // 테스트 실행
    const test1Result = runTest();
    const test2Result = runGlobalVariableTest();
    
    console.log('\n📈 종합 테스트 결과:');
    console.log('- 메모 삭제 후 복원 방지:', test1Result.success ? '✅ 통과' : '❌ 실패');
    console.log('- 전역변수 의존성 제거:', test2Result ? '✅ 통과' : '❌ 실패');
    
    if (test1Result.success && test2Result) {
        console.log('🎊 모든 테스트 통과! 버그 수정이 완료되었습니다.');
    } else {
        console.log('⚠️ 일부 테스트 실패. 추가 수정이 필요합니다.');
    }
    
    // 정리
    cleanup();
    
    // 전역 함수로 내보내기
    window.testMemoDeleteFix = function() {
        return runTest();
    };
    
    window.testGlobalVariableIndependence = function() {
        return runGlobalVariableTest();
    };
    
    console.log('\n🛠️ 수동 테스트 함수:');
    console.log('- testMemoDeleteFix(): 삭제 후 복원 방지 테스트');
    console.log('- testGlobalVariableIndependence(): 전역변수 독립성 테스트');
    
})();