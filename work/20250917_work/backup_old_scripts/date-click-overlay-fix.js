// 날짜 클릭시 오버레이 작동 문제 해결 스크립트
// 날짜별 메모 모달이 열릴 때 나타나는 메모 아이콘 오버레이 문제를 완전히 해결

(function() {
    console.log('🔧 날짜 클릭 오버레이 수정 스크립트 로드됨');

    // 메모 아이콘 오버레이를 숨기는 함수
    function hideMemIconOverlay() {
        console.log('🔍 메모 아이콘 오버레이 검색 시작...');

        // 메모 아이콘이 포함된 가능한 요소들 찾기
        const potentialOverlays = document.querySelectorAll('*');
        let hiddenCount = 0;

        potentialOverlays.forEach(element => {
            const text = element.textContent || '';
            const innerHTML = element.innerHTML || '';

            // 메모 아이콘 패턴이 반복되는 요소 찾기 (단, HTML, BODY, HEAD 제외)
            if ((text.includes('📝') && text.includes('📅')) ||
                (innerHTML.includes('📝') && innerHTML.includes('📅'))) {

                // HTML, BODY, HEAD 요소는 절대 숨기지 않음
                if (element.tagName === 'HTML' || element.tagName === 'BODY' || element.tagName === 'HEAD') {
                    return;
                }

                // 반복 패턴 확인 (📝 📅 📝 📅 같은 형태)
                const iconPattern = /📝.*?📅.*?📝.*?📅/;
                if (iconPattern.test(text) || iconPattern.test(innerHTML)) {
                    console.log('🎯 메모 아이콘 오버레이 발견:', element.className || element.tagName);

                    // 완전히 숨김 처리
                    element.style.display = 'none !important';
                    element.style.visibility = 'hidden !important';
                    element.style.opacity = '0 !important';
                    element.style.zIndex = '-9999 !important';
                    element.style.position = 'absolute !important';
                    element.style.left = '-9999px !important';
                    element.style.top = '-9999px !important';
                    element.style.transform = 'translateX(-100vw) !important';
                    element.style.pointerEvents = 'none !important';

                    // CSS 클래스 추가
                    element.classList.add('memo-icon-overlay-hidden');
                    element.setAttribute('aria-hidden', 'true');
                    element.setAttribute('data-overlay-fix', 'memo-icons');

                    hiddenCount++;
                }
            }
        });

        console.log(`✅ 메모 아이콘 오버레이 숨김 완료: ${hiddenCount}개`);
        return hiddenCount;
    }

    // 날짜별 메모 모달이 열릴 때 오버레이 숨기기
    function enhanceOpenDateMemoModal() {
        if (window.openDateMemoModal) {
            const originalOpenDateMemoModal = window.openDateMemoModal;

            window.openDateMemoModal = function() {
                console.log('🔧 메모 아이콘 오버레이 방지가 추가된 openDateMemoModal 호출');

                // 원본 함수 실행
                const result = originalOpenDateMemoModal.apply(this, arguments);

                // 오버레이 숨기기 작업
                setTimeout(() => {
                    hideMemIconOverlay();
                }, 10);

                setTimeout(() => {
                    hideMemIconOverlay();
                }, 50);

                setTimeout(() => {
                    hideMemIconOverlay();
                }, 200);

                return result;
            };

            console.log('✅ openDateMemoModal 함수에 오버레이 방지 기능 추가 완료');
        } else {
            console.log('⚠️ openDateMemoModal 함수 없음 - 나중에 재시도');
            setTimeout(enhanceOpenDateMemoModal, 1000);
        }
    }

    // 날짜 클릭 이벤트에 오버레이 방지 추가
    function enhanceDateClickEvents() {
        const calendar = document.querySelector('#daysGrid, .calendar-grid, .days-grid');
        if (calendar) {
            calendar.addEventListener('click', function(e) {
                if (e.target.classList.contains('day') ||
                    e.target.closest('.day')) {

                    console.log('📅 날짜 클릭 감지 - 오버레이 방지 실행');

                    // 즉시 실행
                    hideMemIconOverlay();

                    // 지연 실행
                    setTimeout(hideMemIconOverlay, 50);
                    setTimeout(hideMemIconOverlay, 200);
                    setTimeout(hideMemIconOverlay, 500);
                }
            }, true);

            console.log('✅ 날짜 클릭 이벤트에 오버레이 방지 기능 추가 완료');
        }
    }

    // MutationObserver로 동적 생성되는 오버레이 감시
    function setupOverlayObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const text = node.textContent || '';
                            const innerHTML = node.innerHTML || '';

                            // 메모 아이콘 패턴 확인
                            if ((text.includes('📝') && text.includes('📅')) ||
                                (innerHTML.includes('📝') && innerHTML.includes('📅'))) {

                                const iconPattern = /📝.*?📅.*?📝.*?📅/;
                                if (iconPattern.test(text) || iconPattern.test(innerHTML)) {
                                    console.log('🚨 동적 메모 아이콘 오버레이 감지 - 즉시 숨김');

                                    node.style.display = 'none !important';
                                    node.style.visibility = 'hidden !important';
                                    node.style.opacity = '0 !important';
                                    node.style.zIndex = '-9999 !important';
                                    node.classList.add('memo-icon-overlay-hidden');
                                    node.setAttribute('data-overlay-fix', 'memo-icons-dynamic');
                                }
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ 동적 오버레이 감시자 설정 완료');
        return observer;
    }

    // CSS 강제 숨김 스타일 추가
    function addOverlayHiddenStyles() {
        const style = document.createElement('style');
        style.id = 'date-click-overlay-fix-styles';
        style.textContent = `
            .memo-icon-overlay-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -9999 !important;
                transform: translateX(-100vw) !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                pointer-events: none !important;
            }

            /* 메모 아이콘 패턴 강제 숨김 */
            *:contains("📝 📅 📝 📅") {
                display: none !important;
            }

            /* 메모 아이템 타이틀의 before 가상 요소 숨김 - 핵심 수정 */
            .memo-item-title::before {
                display: none !important;
                content: none !important;
            }

            /* 메모 관련 가상 요소 완전 비활성화 */
            .memo-item-title::before,
            .memo-item::before,
            [class*="memo"]::before {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;

        // 기존 스타일이 있으면 제거 후 추가
        const existingStyle = document.getElementById('date-click-overlay-fix-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        document.head.appendChild(style);
        console.log('✅ 오버레이 숨김 CSS (가상 요소 포함) 추가 완료');
    }

    // 디버깅 함수
    window.debugDateClickOverlay = function() {
        const overlayElements = document.querySelectorAll('[data-overlay-fix="memo-icons"], [data-overlay-fix="memo-icons-dynamic"]');
        const hiddenElements = document.querySelectorAll('.memo-icon-overlay-hidden');

        console.log('🔍 오버레이 수정 상태:');
        console.log('- 수정된 오버레이 요소:', overlayElements.length);
        console.log('- 숨겨진 요소:', hiddenElements.length);

        // 현재 보이는 메모 아이콘 패턴 찾기
        const allElements = document.querySelectorAll('*');
        const visibleIconPatterns = [];

        allElements.forEach(element => {
            const text = element.textContent || '';
            const computed = window.getComputedStyle(element);

            if (text.includes('📝') && text.includes('📅') &&
                computed.display !== 'none' && computed.visibility !== 'hidden') {
                visibleIconPatterns.push({
                    element: element,
                    text: text,
                    className: element.className
                });
            }
        });

        console.log('- 여전히 보이는 메모 아이콘 패턴:', visibleIconPatterns.length);
        visibleIconPatterns.forEach((pattern, index) => {
            console.log(`  ${index + 1}:`, pattern);
        });

        return {
            fixedElements: overlayElements.length,
            hiddenElements: hiddenElements.length,
            visiblePatterns: visibleIconPatterns.length,
            visibleDetails: visibleIconPatterns
        };
    };

    window.forceHideMemIconOverlay = hideMemIconOverlay;

    // 초기화
    function init() {
        addOverlayHiddenStyles();
        enhanceOpenDateMemoModal();
        enhanceDateClickEvents();
        setupOverlayObserver();

        // 즉시 초기 정리 실행
        hideMemIconOverlay();

        console.log('✅ 날짜 클릭 오버레이 수정 시스템 초기화 완료');
        console.log('🛠️ 디버깅: debugDateClickOverlay(), forceHideMemIconOverlay()');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 실행
    window.addEventListener('load', function() {
        setTimeout(init, 500);

        // 추가 정리
        setTimeout(hideMemIconOverlay, 1000);
        setTimeout(hideMemIconOverlay, 2000);
    });

})();