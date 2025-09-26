// 브라우저 캐시 문제 해결 스크립트

(function() {
    'use strict';
    
    // 캐시 버스터 - 강제 새로고침 유도
    const timestamp = Date.now();
    
    // 메타 태그로 캐시 방지
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Cache-Control';
    metaTag.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(metaTag);
    
    const pragmaTag = document.createElement('meta');
    pragmaTag.httpEquiv = 'Pragma';
    pragmaTag.content = 'no-cache';
    document.head.appendChild(pragmaTag);
    
    const expiresTag = document.createElement('meta');
    expiresTag.httpEquiv = 'Expires';
    expiresTag.content = '0';
    document.head.appendChild(expiresTag);
    
    // localStorage에서 마지막 업데이트 시간 확인
    const lastUpdate = localStorage.getItem('calendar-last-update');
    const currentUpdate = '2025-01-28-fix'; // 수정 버전 태그
    
    if (lastUpdate !== currentUpdate) {
        console.log('🔄 캐시 클리어 중...');
        
        // 관련 캐시 데이터 삭제
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('calendar') || key.includes('theme'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            if (key !== 'theme') { // 테마 설정은 보존
                localStorage.removeItem(key);
            }
        });
        
        localStorage.setItem('calendar-last-update', currentUpdate);
        
        // 강제 스타일 리로드
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            if (link.href.includes('calendar') || link.href.includes('theme')) {
                const newHref = link.href + (link.href.includes('?') ? '&' : '?') + 't=' + timestamp;
                link.href = newHref;
            }
        });
        
        console.log('✅ 캐시 클리어 완료');
    }
    
})();