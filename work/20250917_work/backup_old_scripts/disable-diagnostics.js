// 진단 시스템 무한루프 방지 및 성능 개선 스크립트
(function() {
    console.log('🛑 진단 시스템 무한루프 방지 스크립트 로드됨');

    // 무한루프를 야기하는 모든 진단 관련 타이머 정리
    function disableAllDiagnostics() {
        // setInterval 제한
        const originalSetInterval = window.setInterval;
        window.setInterval = function(callback, delay, ...args) {
            // 진단 관련 interval 차단
            if (delay < 5000) { // 5초 미만의 빈번한 interval 차단
                console.log('🚫 빈번한 interval 차단됨:', delay + 'ms');
                return null;
            }
            return originalSetInterval.call(this, callback, delay, ...args);
        };

        // setTimeout 제한 (과도한 recursive setTimeout 방지)
        let timeoutCount = 0;
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(callback, delay, ...args) {
            timeoutCount++;
            if (timeoutCount > 100) { // 100개 이상의 timeout 방지
                console.log('🚫 과도한 timeout 차단됨');
                return null;
            }

            // 1초 후 카운터 리셋
            originalSetTimeout(() => { timeoutCount = Math.max(0, timeoutCount - 1); }, 1000);

            return originalSetTimeout.call(this, callback, delay, ...args);
        };

        // 진단 관련 전역 변수 정리
        if (window.diagnosticsInterval) {
            clearInterval(window.diagnosticsInterval);
            window.diagnosticsInterval = null;
        }

        // 기존 모든 타이머 정리
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }

        const highestIntervalId = setInterval(() => {}, 10000);
        for (let i = 0; i < highestIntervalId; i++) {
            clearInterval(i);
        }

        console.log('✅ 진단 시스템 무한루프 방지 완료');
    }

    // 중복 ID 문제 해결
    function fixDuplicateIds() {
        const duplicateElements = document.querySelectorAll('#notificationStatus');
        if (duplicateElements.length > 1) {
            // 첫 번째 요소만 남기고 나머지는 ID 제거
            for (let i = 1; i < duplicateElements.length; i++) {
                duplicateElements[i].id = 'notificationStatus_' + i;
                console.log(`🔧 중복 ID 수정: notificationStatus -> notificationStatus_${i}`);
            }
        }
    }

    // 디버깅 함수
    window.emergencyStop = function() {
        disableAllDiagnostics();
        fixDuplicateIds();
        console.log('🚨 긴급 정지 완료');
    };

    // 초기화
    function init() {
        disableAllDiagnostics();
        fixDuplicateIds();
        console.log('✅ 진단 시스템 무한루프 방지 시스템 초기화 완료');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 실행
    window.addEventListener('load', function() {
        setTimeout(init, 1000);
    });

})();