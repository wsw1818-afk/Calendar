/**
 * 즉시 실행 달력 복구 - 브라우저 콘솔에 붙여넣기용
 * 메뉴 클릭 시 달력이 변형되는 문제 즉시 해결
 */

// 즉시 실행 함수
(function immediateCalendarRestore() {
    console.log('🔧 즉시 달력 복구 실행');
    
    // 1. 변형 방지 CSS 적용
    const style = document.createElement('style');
    style.id = 'immediateRestoreCSS';
    style.textContent = `
        /* 달력 원본 모양 고정 */
        body,
        .container,
        .calendar-container,
        #calendar,
        .calendar {
            transform: none !important;
            scale: 1 !important;
            zoom: 1 !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
        }
        
        /* body 스케일 강제 제거 */
        body[style*="transform"],
        body[style*="scale"] {
            transform: none !important;
            scale: 1 !important;
        }
        
        /* 미리보기 모드 무력화 */
        .safe-preview-mode,
        .preview-mode,
        .unified-preview-mode {
            transform: none !important;
            scale: 1 !important;
        }
        
        /* 메뉴 버튼 정상 작동 */
        .menu-button,
        .control-button,
        [id$="Btn"],
        button {
            pointer-events: auto !important;
            cursor: pointer !important;
            z-index: 1000 !important;
            transform: none !important;
            scale: 1 !important;
        }
    `;
    
    // 기존 스타일 제거 후 추가
    const existing = document.getElementById('immediateRestoreCSS');
    if (existing) existing.remove();
    document.head.appendChild(style);
    
    // 2. 달력 강제 복구
    function forceRestore() {
        // body 복구
        document.body.style.transform = 'none';
        document.body.style.scale = '1';
        document.body.style.zoom = '1';
        document.body.classList.remove('safe-preview-mode', 'preview-mode', 'unified-preview-mode');
        
        // 컨테이너 복구
        const containers = document.querySelectorAll('.container, .calendar-container, #calendar, .calendar');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.scale = '1';
            container.style.zoom = '1';
            container.style.width = '';
            container.style.height = '';
            container.style.overflow = '';
            container.style.position = '';
            container.style.margin = '';
        });
        
        console.log('✅ 달력 복구 완료');
    }
    
    // 3. 미리보기 함수들 무력화
    const previewFunctions = [
        'enablePreview',
        'disablePreview', 
        'toggleSafePreview',
        'togglePreview',
        'showPreview',
        'hidePreview'
    ];
    
    previewFunctions.forEach(funcName => {
        window[funcName] = function() {
            console.log(`🚫 ${funcName} 호출 차단됨`);
            forceRestore(); // 호출되면 즉시 복구
            return false;
        };
    });
    
    // 4. 미리보기 상태 객체들 무력화
    if (window.StablePreview) {
        window.StablePreview.isActive = false;
        window.StablePreview.isTransitioning = false;
    }
    
    if (window.PreviewControl) {
        window.PreviewControl.enable = () => { forceRestore(); return false; };
        window.PreviewControl.isEnabled = () => false;
    }
    
    // 5. 실시간 복구 시스템
    const continuousRestore = () => {
        const body = document.body;
        const bodyStyle = window.getComputedStyle(body);
        
        if (bodyStyle.transform !== 'none' && bodyStyle.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
            forceRestore();
        }
    };
    
    // 500ms마다 체크
    setInterval(continuousRestore, 500);
    
    // 6. 메뉴 클릭 보호
    document.addEventListener('click', function(e) {
        const target = e.target;
        const isMenuButton = target.id?.includes('Btn') || 
                           target.classList.contains('menu-button') ||
                           target.classList.contains('control-button') ||
                           target.tagName === 'BUTTON';
        
        if (isMenuButton) {
            console.log(`🎯 메뉴 클릭: ${target.id || target.className}`);
            setTimeout(forceRestore, 50);
            setTimeout(forceRestore, 200);
        }
    }, true);
    
    // 7. 전역 함수 등록
    window.restoreCalendarNow = function() {
        forceRestore();
        return '달력 즉시 복구 완료!';
    };
    
    window.checkCalendarStatus = function() {
        const body = document.body;
        const bodyStyle = window.getComputedStyle(body);
        const container = document.querySelector('.container');
        const containerStyle = container ? window.getComputedStyle(container) : null;
        
        console.table({
            'body 변형': bodyStyle.transform !== 'none',
            'body transform': bodyStyle.transform,
            'container 변형': containerStyle ? containerStyle.transform !== 'none' : false,
            'container transform': containerStyle ? containerStyle.transform : 'N/A'
        });
        
        return {
            body변형: bodyStyle.transform !== 'none',
            container변형: containerStyle ? containerStyle.transform !== 'none' : false
        };
    };
    
    // 8. 즉시 복구 실행
    forceRestore();
    
    // 1초 후에도 한 번 더
    setTimeout(forceRestore, 1000);
    
    console.log('✅ 달력 즉시 복구 완료');
    console.log('💡 수동 복구: restoreCalendarNow()');
    console.log('💡 상태 확인: checkCalendarStatus()');
    
    return '달력 변형 방지 시스템 활성화 완료!';
})();