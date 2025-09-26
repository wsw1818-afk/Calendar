/**
 * Calendar date click fix
 * Ensures clicking a day opens the memo modal with proper year/month/day values.
 */
(function() {
    'use strict';

    const GRID_SELECTOR = '#daysGrid, .days-grid';
    const BIND_ATTRIBUTE = 'memoClickHandlerBound';

    function parseDigits(value) {
        if (!value) {
            return NaN;
        }
        const match = String(value).match(/\d+/g);
        if (!match) {
            return NaN;
        }
        return parseInt(match.join(''), 10);
    }

    function getCurrentYear(defaultYear) {
        const yearSelect = document.getElementById('yearSelect');
        const fromSelect = yearSelect ? parseInt(yearSelect.value, 10) : NaN;
        if (!Number.isNaN(fromSelect)) {
            return fromSelect;
        }
        const fromDigits = parseDigits(yearSelect?.textContent);
        if (!Number.isNaN(fromDigits)) {
            return fromDigits;
        }
        return Number.isInteger(defaultYear) ? defaultYear : new Date().getFullYear();
    }

    function getCurrentMonth(defaultMonth) {
        const monthSelect = document.getElementById('monthSelect');
        const fromSelect = monthSelect ? parseInt(monthSelect.value, 10) : NaN;
        if (!Number.isNaN(fromSelect)) {
            return fromSelect;
        }
        const fromDigits = parseDigits(monthSelect?.textContent);
        if (!Number.isNaN(fromDigits)) {
            return fromDigits;
        }
        if (Number.isInteger(defaultMonth) && defaultMonth >= 1 && defaultMonth <= 12) {
            return defaultMonth;
        }
        return new Date().getMonth() + 1;
    }

    function resolveDateParts(dayElement) {
        const today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = NaN;

        const iso = dayElement.dataset.date;
        if (iso) {
            const parts = iso.split('-');
            if (parts.length === 3) {
                const parsedYear = parseInt(parts[0], 10);
                const parsedMonth = parseInt(parts[1], 10);
                const parsedDay = parseInt(parts[2], 10);
                if (!Number.isNaN(parsedYear)) {
                    year = parsedYear;
                }
                if (!Number.isNaN(parsedMonth)) {
                    month = parsedMonth;
                }
                if (!Number.isNaN(parsedDay)) {
                    day = parsedDay;
                }
            }
        }

        if (Number.isNaN(day)) {
            day = parseInt((dayElement.textContent || '').trim(), 10);
        }

        if (Number.isNaN(day)) {
            return null;
        }

        year = getCurrentYear(year);
        month = getCurrentMonth(month);

        return { year, month, day };
    }

    function highlightDay(target) {
        document.querySelectorAll('.day.selected').forEach((el) => {
            el.classList.remove('selected');
        });
        target.classList.add('selected');
    }

    function ensureDateMemoModalVisible() {
        const modal = document.getElementById('dateMemoModal');
        if (!modal) {
            return;
        }

        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0, 0, 0, 0.35)';

        modal.classList.add('show-modal');

        const content = modal.querySelector('.memo-modal-content');
        if (content) {
            content.style.display = 'block';
            content.style.visibility = 'visible';
            content.style.opacity = '1';
            content.style.margin = 'auto';
            content.style.position = 'relative';
            content.style.transform = 'none';
            content.style.pointerEvents = 'auto';
        }

        const overlay = document.getElementById('fullScreenModalOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    function callOpenDateMemoModal(year, month, day) {
        const openModal = window.openDateMemoModal;
        if (typeof openModal !== 'function') {
            console.warn('[calendar-date-click-fix] window.openDateMemoModal is not available.');
            return;
        }

        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        window.selectedDate = isoDate;

        const fnArity = openModal.length;
        let invoked = false;

        try {
            if (fnArity >= 3 || fnArity === 0) {
                openModal(year, month, day);
                invoked = true;
            }
        } catch (error) {
            console.warn('[calendar-date-click-fix] openDateMemoModal(year, month, day) failed, will retry with string.', error);
        }

        if (!invoked) {
            try {
                openModal(isoDate);
                invoked = true;
            } catch (error) {
                console.error('[calendar-date-click-fix] openDateMemoModal invocation failed.', error);
            }
        }

        if (!invoked && typeof window._originalOpenDateMemoModal === 'function') {
            try {
                window._originalOpenDateMemoModal(year, month, day);
                invoked = true;
            } catch (error) {
                console.error('[calendar-date-click-fix] Fallback _originalOpenDateMemoModal failed.', error);
            }
        }

        if (invoked) {
            requestAnimationFrame(() => ensureDateMemoModalVisible());
            setTimeout(() => ensureDateMemoModalVisible(), 150);
        }
    }

    function handleGridClick(event) {
        const grid = event.currentTarget;
        const dayElement = event.target && event.target.closest('.day');
        if (!dayElement || !grid.contains(dayElement)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const dateParts = resolveDateParts(dayElement);
        if (!dateParts) {
            console.warn('[calendar-date-click-fix] Unable to resolve date for element.', dayElement);
            return;
        }

        const { year, month, day } = dateParts;
        highlightDay(dayElement);
        callOpenDateMemoModal(year, month, day);
    }

    function bindGrid(grid) {
        if (!grid || grid.dataset[BIND_ATTRIBUTE] === 'true') {
            return;
        }
        grid.addEventListener('click', handleGridClick, true);
        grid.dataset[BIND_ATTRIBUTE] = 'true';
    }

    function bindAllGrids() {
        document.querySelectorAll(GRID_SELECTOR).forEach(bindGrid);
    }

    function initObserver() {
        const observer = new MutationObserver(() => {
            bindAllGrids();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        return observer;
    }

    function initialize() {
        bindAllGrids();
        initObserver();
        console.log('[calendar-date-click-fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();