/**
 * 날짜 메모 모달 재열림 문제 수정
 * - 모달 닫기 후 자동으로 다시 열리는 문제 해결
 * - 이벤트 충돌 및 중복 이벤트 리스너 제거
 */

(function() {
    'use strict';
    
    console.log('🔧 모달 재열림 문제 수정 스크립트 시작');
    
    // 전역 플래그 초기화
    window.isModalOperationInProgress = false;
    window.modalCloseProtection = false;
    
    // 기존 이벤트 리스너 제거 함수
    function cleanupEventListeners() {
        // 모든 날짜 셀의 이벤트 리스너 정리
        const dayCells = document.querySelectorAll('.calendar-grid div[data-date]');
        dayCells.forEach(cell => {
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
        });
        console.log('📅 날짜 셀 이벤트 리스너 정리 완료');
    }
    
    // 안전한 모달 닫기 함수
    function safeCloseDateMemoModal() {
        // 이미 처리 중이면 무시
        if (window.isModalOperationInProgress) {
            console.log('⚠️ 모달 작업이 이미 진행 중');
            return;
        }
        
        const modal = document.getElementById('dateMemoModal');
        if (!modal || modal.style.display === 'none') {
            return;
        }
        
        // 작업 시작
        window.isModalOperationInProgress = true;
        window.modalCloseProtection = true;
        
        console.log('🔒 안전한 모달 닫기 시작');
        
        // 즉시 모달 숨기기 (애니메이션 없음)
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.transition = 'none';
        
        // 모달 컨텐츠 초기화
        const modalContent = modal.querySelector('.memo-modal-content');
        if (modalContent) {
            modalContent.style.position = '';
            modalContent.style.left = '';
            modalContent.style.top = '';
            modalContent.style.transform = '';
        }
        
        // 입력 필드 초기화
        const titleInput = document.getElementById('dateMemoTitleInput');
        const contentInput = document.getElementById('dateMemoContentInput');
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        
        // 선택된 날짜 초기화
        if (window.selectedDate) {
            window.selectedDate = null;
        }
        
        // 보호 시간 설정 (300ms로 단축)
        setTimeout(() => {
            window.isModalOperationInProgress = false;
            window.modalCloseProtection = false;
            console.log('✅ 모달 보호 해제');
        }, 300);
    }
    
    // 안전한 모달 열기 함수
    function safeOpenDateMemoModal(year, month, date) {
        // 단순한 중복 열기만 방지 (보호 시간 단축)
        if (window.isModalOperationInProgress) {
            console.log('⚠️ 모달 작업이 이미 진행 중');
            return;
        }
        
        const modal = document.getElementById('dateMemoModal');
        if (!modal) {
            console.error('날짜 메모 모달을 찾을 수 없습니다');
            return;
        }
        
        // 이미 열려있으면 내용만 업데이트
        if (modal.style.display === 'block') {
            console.log(`📅 모달이 열려있음 - 날짜 변경: ${year}-${month}-${date}`);
            // 기존 함수로 내용 업데이트
            if (window.originalOpenDateMemoModal) {
                window.originalOpenDateMemoModal(year, month, date);
            }
            return;
        }
        
        // 작업 시작
        window.isModalOperationInProgress = true;
        
        console.log(`📅 안전한 모달 열기: ${year}-${month}-${date}`);
        
        // unified 시스템 차단 임시 해제
        const wasBlocked = window.preventDateMemoAutoOpen;
        window.preventDateMemoAutoOpen = false;
        
        if (window.MemoSystem && window.MemoSystem.isInitializing) {
            window.MemoSystem.isInitializing = false;
        }
        
        try {
            // 기존 openDateMemoModal 함수 호출
            if (window.originalOpenDateMemoModal) {
                window.originalOpenDateMemoModal(year, month, date);
            } else if (window.openDateMemoModal) {
                // 원본 함수 백업
                window.originalOpenDateMemoModal = window.openDateMemoModal;
                window.originalOpenDateMemoModal(year, month, date);
            }
        } finally {
            // 차단 상태 복원하지 않음 (계속 해제 상태 유지)
            // window.preventDateMemoAutoOpen = wasBlocked;
        }
        
        // 작업 완료 (빠르게)
        setTimeout(() => {
            window.isModalOperationInProgress = false;
        }, 100);
    }
    
    // unified 시스템의 차단 해제
    function disableUnifiedBlocking() {
        // unified 시스템의 초기화 차단 해제
        if (window.MemoSystem && window.MemoSystem.isInitializing) {
            window.MemoSystem.isInitializing = false;
            console.log('🔓 unified 시스템 초기화 차단 해제');
        }
        
        // 전역 차단 플래그들 해제
        window.preventDateMemoAutoOpen = false;
        window.memoSystemInitializing = false;
        
        console.log('✅ unified 시스템 차단 완전 해제');
    }
    
    // DOM 로드 완료 후 실행
    function initialize() {
        console.log('🚀 모달 재열림 수정 초기화');
        
        // unified 시스템 차단 해제
        disableUnifiedBlocking();
        
        // 기존 이벤트 리스너 정리
        cleanupEventListeners();
        
        // closeDateMemoModal 함수 교체
        if (window.closeDateMemoModal) {
            window.originalCloseDateMemoModal = window.closeDateMemoModal;
        }
        window.closeDateMemoModal = safeCloseDateMemoModal;
        
        // openDateMemoModal 함수 교체
        if (window.openDateMemoModal) {
            window.originalOpenDateMemoModal = window.openDateMemoModal;
            window.openDateMemoModal = safeOpenDateMemoModal;
        }
        
        // 날짜 클릭 이벤트를 더 간단하게 처리
        document.addEventListener('click', function(e) {
            // 달력 날짜 셀 클릭 확인
            if (e.target.matches('.calendar-grid div') && !e.target.classList.contains('other-month')) {
                // 작업 중이 아닐 때만 처리
                if (!window.isModalOperationInProgress) {
                    const dateStr = e.target.textContent.trim();
                    const dateNum = parseInt(dateStr);
                    
                    if (dateNum && dateNum >= 1 && dateNum <= 31) {
                        // 현재 년월을 전역 변수에서 가져오기
                        const year = window.currentYear || 2025;
                        const month = window.currentMonth !== undefined ? window.currentMonth + 1 : 8;
                        
                        console.log(`📅 수정된 날짜 클릭: ${year}-${month}-${dateNum}`);
                        
                        // 이벤트 차단
                        e.stopPropagation();
                        e.preventDefault();
                        
                        // 모달 열기
                        safeOpenDateMemoModal(year, month, dateNum);
                    }
                }
            }
        }, true);
        
        // 모달 닫기 버튼 이벤트
        const closeBtn = document.getElementById('closeDateMemo');
        if (closeBtn) {
            // 기존 이벤트 리스너 제거
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // 새 이벤트 리스너 등록
            newCloseBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                safeCloseDateMemoModal();
            });
        }
        
        // 모달 외부 클릭 이벤트
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            dateMemoModal.addEventListener('click', function(e) {
                if (e.target === dateMemoModal) {
                    e.stopPropagation();
                    e.preventDefault();
                    safeCloseDateMemoModal();
                }
            });
        }
        
        // ESC 키 처리
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('dateMemoModal');
                if (modal && modal.style.display === 'block') {
                    e.stopPropagation();
                    e.preventDefault();
                    safeCloseDateMemoModal();
                }
            }
        });
        
        console.log('✅ 모달 재열림 수정 완료');
        
        // 주기적으로 unified 차단 해제 (5초마다)
        setInterval(disableUnifiedBlocking, 5000);
    }
    
    // DOM 로드 상태에 따라 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 이미 로드된 경우 지연 실행
        setTimeout(initialize, 100);
    }
    
})();