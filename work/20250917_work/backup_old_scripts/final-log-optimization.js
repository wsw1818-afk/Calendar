/**
 * 최종 로그 최적화 스크립트
 * 반복적인 스팸 로그 메시지들을 줄여 콘솔 성능을 향상시킵니다
 */

(function() {
    'use strict';

    console.log('🔧 최종 로그 최적화 시작...');

    // 원본 console.log 저장
    const originalLog = console.log;
    const spamMessages = new Map();
    const spamPatterns = [
        /🔧 X 버튼 제거 시작/,
        /🔍 찾은 첨부파일 버튼: 0/,
        /📂 첨부파일 뷰어 테스트 시작/,
        /🔍 발견된 첨부파일 버튼: 0/,
        /🔍 새로 추가된 첨부파일 버튼: 0/
    ];

    // 로그 throttling 시스템
    console.log = function(...args) {
        const message = args.join(' ');

        // 스팸 패턴 확인
        for (const pattern of spamPatterns) {
            if (pattern.test(message)) {
                const key = pattern.source;
                const count = spamMessages.get(key) || 0;

                if (count === 0) {
                    // 첫 번째 메시지는 표시
                    spamMessages.set(key, 1);
                    originalLog.call(this, message);
                } else if (count === 10) {
                    // 10번째에 요약 메시지
                    originalLog.call(this, `⚡ ${message.substring(0, 30)}... (이후 스팸 방지)`);
                    spamMessages.set(key, count + 1);
                } else {
                    // 그 외에는 카운트만 증가
                    spamMessages.set(key, count + 1);
                }
                return;
            }
        }

        // 일반 메시지는 그대로 표시
        originalLog.apply(this, args);
    };

    // 주기적으로 카운터 리셋 (메모리 누수 방지)
    setInterval(() => {
        spamMessages.clear();
    }, 300000); // 5분마다

    console.log('✅ 최종 로그 최적화 완료!');
    console.log('📌 스팸 방지 패턴 수:', spamPatterns.length);

})();