// currentMemoId 설정 문제 해결

(function() {
    'use strict';
    
    console.log('🔧 currentMemoId 설정 수정 시스템 로드됨');
    
    // 원본 openMemoDetail 함수 백업 및 확장
    if (typeof window.openMemoDetail === 'function') {
        const originalOpenMemoDetail = window.openMemoDetail;
        
        window.openMemoDetail = function(id) {
            console.log('🔧 강화된 openMemoDetail 호출, ID:', id);
            
            // currentMemoId 강제 설정
            window.currentMemoId = id;
            console.log('✅ currentMemoId 강제 설정:', window.currentMemoId);
            
            // 메모 상세 모달에 데이터 속성으로도 ID 저장
            setTimeout(() => {
                const detailModal = document.getElementById('memoDetailModal');
                if (detailModal) {
                    detailModal.setAttribute('data-memo-id', id);
                    console.log('✅ 모달에 data-memo-id 설정:', id);
                }
            }, 100);
            
            // 원본 함수 실행
            return originalOpenMemoDetail.call(this, id);
        };
        
        console.log('✅ openMemoDetail 함수 강화 완료');
    }
    
    // closeMemoDetail 시에 currentMemoId를 바로 null로 설정하지 않고 지연
    if (typeof window.closeMemoDetail === 'function') {
        const originalCloseMemoDetail = window.closeMemoDetail;
        
        window.closeMemoDetail = function() {
            console.log('🔧 강화된 closeMemoDetail 호출, 현재 ID:', window.currentMemoId);
            
            // 편집 중일 수 있으므로 즉시 null로 설정하지 않음
            const tempCurrentId = window.currentMemoId;
            
            // 원본 함수 실행
            const result = originalCloseMemoDetail.call(this);
            
            // 1초 후에 currentMemoId 정리 (편집 모달이 열릴 시간 확보)
            setTimeout(() => {
                // 편집 모달이 열려있으면 currentMemoId 유지
                const editModal = document.getElementById('editMemoModal');
                if (!editModal || editModal.style.display === 'none') {
                    window.currentMemoId = null;
                    console.log('🔧 지연된 currentMemoId 정리');
                } else {
                    window.currentMemoId = tempCurrentId;
                    console.log('🔧 편집 모달 활성화로 currentMemoId 유지:', tempCurrentId);
                }
            }, 1000);
            
            return result;
        };
        
        console.log('✅ closeMemoDetail 함수 강화 완료');
    }
    
    // 편집 버튼 클릭 시 추가 ID 복구 로직
    function enhanceEditButton() {
        const editBtn = document.getElementById('editMemoBtn');
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                console.log('🔧 편집 버튼 클릭 감지');
                
                // currentMemoId가 없으면 모달에서 복구 시도
                if (!window.currentMemoId) {
                    const detailModal = document.getElementById('memoDetailModal');
                    if (detailModal) {
                        const storedId = detailModal.getAttribute('data-memo-id');
                        if (storedId) {
                            window.currentMemoId = parseInt(storedId);
                            console.log('🔧 모달 데이터 속성에서 ID 복구:', window.currentMemoId);
                        }
                        
                        // 여전히 없으면 제목으로 찾기
                        if (!window.currentMemoId) {
                            const titleElement = document.getElementById('memoDetailTitle');
                            if (titleElement) {
                                const title = titleElement.textContent;
                                const allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                                const foundMemo = allMemos.find(m => m.title === title);
                                if (foundMemo) {
                                    window.currentMemoId = foundMemo.id;
                                    console.log('🔧 제목으로 ID 복구:', window.currentMemoId);
                                }
                            }
                        }
                    }
                }
                
                console.log('🔧 편집 버튼 클릭 시 최종 currentMemoId:', window.currentMemoId);
            });
        }
    }
    
    // 주기적으로 편집 버튼 강화 시도
    function setupEditButtonEnhancement() {
        enhanceEditButton();
        
        // 메모 상세 모달이 열릴 때마다 편집 버튼 강화
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'memoDetailModal' && target.style.display === 'block') {
                        setTimeout(enhanceEditButton, 200);
                    }
                }
            });
        });
        
        const detailModal = document.getElementById('memoDetailModal');
        if (detailModal) {
            observer.observe(detailModal, { attributes: true });
        }
    }
    
    // 초기화
    setTimeout(() => {
        setupEditButtonEnhancement();
        console.log('✅ currentMemoId 수정 시스템 초기화 완료');
    }, 1000);
    
})();