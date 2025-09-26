/**
 * 메모 모달이 로딩 중 멈춘 상태를 강제로 복구하는 스크립트
 * 날짜 메모/메모 상세 모달은 사용자 상호작용을 보호하면서 기타 잔여 모달만 닫습니다.
 */
(function() {
    'use strict';

    console.log('✅ 메모 모달 로딩 복구 스크립트 로드');

    const PROTECTED_IDS = new Set(['dateMemoModal', 'memoDetailModal']);

    function isProtected(node) {
        if (!node) return false;
        if (PROTECTED_IDS.has(node.id)) {
            return true;
        }
        return Boolean(node.closest && [...PROTECTED_IDS].some(id => node.closest(`#${id}`)));
    }

    function hideModalElement(element) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.classList.add('memo-cleanup-hidden');
    }

    function fixStuckModal() {
        const modalIds = ['memoDetailModal', 'createModal', 'settingsModal', 'storageModal', 'excelModal'];
        let fixed = 0;

        modalIds.forEach((id) => {
            const modal = document.getElementById(id);
            if (modal && !isProtected(modal)) {
                const style = window.getComputedStyle(modal);
                if (style.display !== 'none') {
                    hideModalElement(modal);
                    fixed += 1;
                    console.log(`[memo-loading-fix] 모달 닫기: ${id}`);
                }
            }
        });

        document.querySelectorAll('.modal, .modal-overlay, [class*="modal"]').forEach((element) => {
            if (isProtected(element)) {
                return;
            }
            const style = window.getComputedStyle(element);
            if (style.display !== 'none') {
                hideModalElement(element);
                fixed += 1;
            }
        });

        document.querySelectorAll('[class*="loading"], [class*="spinner"], .loader').forEach((element) => {
            if (!isProtected(element)) {
                element.remove();
            }
        });

        document.querySelectorAll('[class*="backdrop"], [class*="overlay"], .modal-backdrop').forEach((element) => {
            if (!isProtected(element)) {
                element.remove();
            }
        });

        return fixed;
    }

    function restoreClickEvents() {
        document.querySelectorAll('*').forEach((element) => {
            if (!isProtected(element) && window.getComputedStyle(element).pointerEvents === 'none') {
                element.style.pointerEvents = 'auto';
            }
        });
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.classList.remove('modal-open', 'no-scroll');
    }

    function clearStuckStates() {
        ['modalState', 'loadingState', 'memoDetailState'].forEach((key) => localStorage.removeItem(key));
        if (window.currentMemoId && !PROTECTED_IDS.has(window.currentMemoId)) {
            window.currentMemoId = null;
        }
        window.isModalOpen = false;
    }

    function emergencyReset() {
        const fixed = fixStuckModal();
        restoreClickEvents();
        clearStuckStates();
        return fixed;
    }

    // 최초 한 번만 실행하여 잔여 모달 제거
    emergencyReset();

    // 전역 도구 등록
    window.fixStuckModal = emergencyReset;
})();