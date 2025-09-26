/**
 * 스티커 메모 위치 수정
 * 달력 위가 아닌 최상위 레이어에서 열리도록 수정
 */

(function() {
    'use strict';
    
    console.log('📌 스티커 메모 위치 수정 시작');
    
    /**
     * openStickyMemo 함수 덮어쓰기
     */
    function fixStickyMemoPosition() {
        const originalOpen = window.openStickyMemo;
        
        window.openStickyMemo = function() {
            console.log('🔧 수정된 openStickyMemo 실행');
            
            // 스티커 메모 요소 찾기 또는 생성
            let stickyMemo = document.getElementById('stickyMemo');
            
            if (!stickyMemo) {
                // 기존 생성 함수 호출
                if (window.createStickyMemo) {
                    stickyMemo = window.createStickyMemo();
                } else {
                    console.error('createStickyMemo 함수가 없습니다');
                    return;
                }
            }
            
            // 스티커 메모를 body 최상위로 이동
            if (stickyMemo.parentNode !== document.body) {
                document.body.appendChild(stickyMemo);
            }
            
            // 위치와 스타일 설정 (최상위 레이어)
            stickyMemo.style.cssText = `
                position: fixed !important;
                z-index: 999999 !important;
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 350px !important;
                min-height: 400px !important;
                pointer-events: auto !important;
                isolation: isolate !important;
                transform: translateZ(0) !important;
            `;
            
            // 저장된 위치 복원 또는 기본 위치 설정
            const savedPosition = localStorage.getItem('stickyMemoPosition');
            if (savedPosition) {
                try {
                    const pos = JSON.parse(savedPosition);
                    if (pos.x !== undefined && pos.y !== undefined) {
                        stickyMemo.style.left = pos.x + 'px';
                        stickyMemo.style.top = pos.y + 'px';
                    } else if (pos.left && pos.top) {
                        stickyMemo.style.left = pos.left;
                        stickyMemo.style.top = pos.top;
                    } else {
                        // 기본 위치 (화면 중앙 상단)
                        setDefaultPosition(stickyMemo);
                    }
                } catch (e) {
                    setDefaultPosition(stickyMemo);
                }
            } else {
                setDefaultPosition(stickyMemo);
            }
            
            // 크기 복원
            const savedSize = localStorage.getItem('stickyMemoSize');
            if (savedSize) {
                try {
                    const size = JSON.parse(savedSize);
                    if (size.width) stickyMemo.style.width = size.width;
                    if (size.height) stickyMemo.style.height = size.height;
                } catch (e) {
                    // 기본 크기 유지
                }
            }
            
            // 추가 스타일 적용
            applyStickyStyles(stickyMemo);
            
            // 스티커 메모 초기화
            if (window.StickyMemoStable) {
                window.StickyMemoStable.init();
            }
            
            // 이벤트 초기화
            initStickyEvents(stickyMemo);
            
            // 메모 로드
            if (window.loadStickyMemos) {
                window.loadStickyMemos();
            }
            
            stickyMemo.classList.add('active');
            
            console.log('✅ 스티커 메모 열기 완료', {
                position: {
                    left: stickyMemo.style.left,
                    top: stickyMemo.style.top
                },
                zIndex: stickyMemo.style.zIndex,
                parent: stickyMemo.parentNode.tagName
            });
        };
    }
    
    /**
     * 기본 위치 설정
     */
    function setDefaultPosition(stickyMemo) {
        // 화면 중앙 상단에 위치
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const memoWidth = 350;
        const memoHeight = 400;
        
        const left = (windowWidth - memoWidth) / 2;
        const top = Math.max(50, (windowHeight - memoHeight) / 3); // 상단 1/3 지점
        
        stickyMemo.style.left = left + 'px';
        stickyMemo.style.top = top + 'px';
        
        console.log('📍 기본 위치 설정:', { left, top });
    }
    
    /**
     * 스티커 스타일 적용
     */
    function applyStickyStyles(stickyMemo) {
        // 배경 스타일
        stickyMemo.style.setProperty('background', 'linear-gradient(135deg, rgba(255, 249, 196, 0.98) 0%, rgba(255, 245, 157, 0.98) 100%)', 'important');
        stickyMemo.style.setProperty('backdrop-filter', 'blur(20px) saturate(180%)', 'important');
        stickyMemo.style.setProperty('border-radius', '20px', 'important');
        stickyMemo.style.setProperty('box-shadow', '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 120px rgba(255, 193, 7, 0.5)', 'important');
        stickyMemo.style.setProperty('border', '1px solid rgba(255, 193, 7, 0.3)', 'important');
        
        // 애니메이션
        stickyMemo.style.setProperty('animation', 'fadeInScale 0.3s ease-out', 'important');
    }
    
    /**
     * 이벤트 초기화
     */
    function initStickyEvents(stickyMemo) {
        // 닫기 버튼
        const closeBtn = stickyMemo.querySelector('#stickyClose');
        if (closeBtn) {
            closeBtn.onclick = function() {
                if (window.closeStickyMemo) {
                    window.closeStickyMemo();
                } else {
                    stickyMemo.style.display = 'none';
                }
            };
        }
        
        // 최소화 버튼
        const minimizeBtn = stickyMemo.querySelector('#stickyMinimize');
        if (minimizeBtn && window.minimizeStickyMemo) {
            minimizeBtn.onclick = window.minimizeStickyMemo;
        }
        
        // 최대화 버튼
        const maximizeBtn = stickyMemo.querySelector('#stickyMaximize');
        if (maximizeBtn && window.maximizeStickyMemo) {
            maximizeBtn.onclick = window.maximizeStickyMemo;
        }
        
        // 저장 버튼
        const saveBtn = stickyMemo.querySelector('#saveStickyMemo');
        if (saveBtn && window.saveStickyMemo) {
            saveBtn.onclick = window.saveStickyMemo;
        }
    }
    
    /**
     * 애니메이션 스타일 추가
     */
    function addAnimationStyles() {
        if (document.getElementById('sticky-position-fix-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-position-fix-styles';
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translateZ(0) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateZ(0) scale(1);
                }
            }
            
            #stickyMemo {
                /* 최상위 레이어 보장 */
                z-index: 999999 !important;
                position: fixed !important;
                isolation: isolate !important;
            }
            
            #stickyMemo.active {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 달력 위에 표시되도록 */
            .calendar-container {
                position: relative !important;
                z-index: 1 !important;
            }
            
            #calendar {
                position: relative !important;
                z-index: 1 !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 스티커 버튼 이벤트 수정
     */
    function fixStickyButton() {
        // 스티커 버튼 찾기
        const stickyButtons = document.querySelectorAll('[onclick*="openStickyMemo"], .sticky-btn, #stickyBtn');
        
        stickyButtons.forEach(btn => {
            // 기존 onclick 제거
            btn.removeAttribute('onclick');
            
            // 새 이벤트 추가
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📌 스티커 버튼 클릭');
                window.openStickyMemo();
            });
        });
        
        console.log(`✅ ${stickyButtons.length}개 스티커 버튼 수정 완료`);
    }
    
    /**
     * 초기화
     */
    function init() {
        console.log('🚀 스티커 메모 위치 수정 초기화');
        
        // 스타일 추가
        addAnimationStyles();
        
        // openStickyMemo 함수 수정
        fixStickyMemoPosition();
        
        // 버튼 이벤트 수정
        setTimeout(fixStickyButton, 100);
        
        // 페이지 로드 후 다시 확인
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixStickyButton);
        }
        
        console.log('✅ 스티커 메모 위치 수정 완료');
    }
    
    /**
     * 디버그 함수
     */
    window.debugStickyPosition = function() {
        const stickyMemo = document.getElementById('stickyMemo');
        if (!stickyMemo) {
            console.log('❌ 스티커 메모가 없습니다');
            return;
        }
        
        const rect = stickyMemo.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(stickyMemo);
        
        console.group('📊 스티커 메모 위치 정보');
        console.log('위치:', {
            left: stickyMemo.style.left,
            top: stickyMemo.style.top,
            right: stickyMemo.style.right,
            bottom: stickyMemo.style.bottom
        });
        console.log('크기:', {
            width: rect.width,
            height: rect.height
        });
        console.log('z-index:', computedStyle.zIndex);
        console.log('position:', computedStyle.position);
        console.log('부모 요소:', stickyMemo.parentNode.tagName);
        console.log('화면 내 위치:', rect);
        console.groupEnd();
    };
    
    /**
     * 강제 최상위로 이동
     */
    window.forceStickToTop = function() {
        const stickyMemo = document.getElementById('stickyMemo');
        if (!stickyMemo) {
            console.log('❌ 스티커 메모가 없습니다');
            return;
        }
        
        // body 최상위로 이동
        document.body.appendChild(stickyMemo);
        
        // 최상위 z-index 설정
        stickyMemo.style.setProperty('z-index', '999999', 'important');
        stickyMemo.style.setProperty('position', 'fixed', 'important');
        
        console.log('✅ 스티커 메모를 최상위로 이동했습니다');
    };
    
    // 초기화 실행
    init();
    
    console.log('✅ 스티커 메모 위치 수정 모듈 준비 완료');
    console.log('🛠️ 디버그: debugStickyPosition(), forceStickToTop()');
    
})();