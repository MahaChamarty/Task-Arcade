/**
 * TaskArcade Application Controller
 * Handles UI interactions, Theme Toggling (Dark/Light), Filtering & Sorting, Modals, Animations, and Gamification
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- APP STATE ---
    let currentFilter = 'all';
    let currentCategory = 'all';
    let currentSort = 'newest';
    let searchQuery = '';
    let viewMode = 'grid';
    let selectedColor = 'violet';
    let deletingTaskId = null;
    let lastDeletedTask = null;
    let lastDeletedIndex = -1;

    // --- DOM ELEMENTS ---
    const tasksContainer = document.getElementById('tasks-container');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-filter-select');
    const sortSelect = document.getElementById('sort-select');
    const viewGridBtn = document.getElementById('view-grid-btn');
    const viewListBtn = document.getElementById('view-list-btn');

    // Header & Theme Elements
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    const themeIcon = document.getElementById('theme-icon');
    const levelDisplay = document.getElementById('level-display');
    const xpTextDisplay = document.getElementById('xp-text-display');
    const xpFillBar = document.getElementById('xp-fill-bar');
    const streakCount = document.getElementById('streak-count');
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const soundIcon = document.getElementById('sound-icon');

    // Boss Arena Elements
    const bossArena = document.getElementById('boss-arena');
    const bossAvatar = document.getElementById('boss-avatar');
    const bossName = document.getElementById('boss-name');
    const bossDesc = document.getElementById('boss-desc');
    const hpAsciiText = document.getElementById('hp-ascii-text');
    const bossHpFill = document.getElementById('boss-hp-fill');
    const bossDefeatedBanner = document.getElementById('boss-defeated-banner');

    // Metric Counters
    const statTotalTasks = document.getElementById('stat-total-tasks');
    const statCompletedTasks = document.getElementById('stat-completed-tasks');
    const statPendingTasks = document.getElementById('stat-pending-tasks');
    const statCompletionRate = document.getElementById('stat-completion-rate');

    // Task Modal Elements
    const taskModal = document.getElementById('task-modal');
    const btnOpenAddModal = document.getElementById('btn-open-add-modal');
    const btnCloseTaskModal = document.getElementById('btn-close-task-modal');
    const btnCancelTaskModal = document.getElementById('btn-cancel-task-modal');
    const btnSaveTask = document.getElementById('btn-save-task');
    const modalTitleText = document.getElementById('modal-title-text');
    const modalTaskId = document.getElementById('modal-task-id');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskDescInput = document.getElementById('task-desc-input');
    const taskPriorityInput = document.getElementById('task-priority-input');
    const taskCategoryInput = document.getElementById('task-category-input');
    const taskDueInput = document.getElementById('task-due-input');
    const colorSwatchesContainer = document.getElementById('color-swatches-container');

    // Delete Modal Elements
    const deleteModal = document.getElementById('delete-modal');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // --- INITIALIZATION ---
    function initApp() {
        initTheme();
        updateSoundIcon();
        renderHeaderStats();
        renderBossArena();
        renderMetrics();
        renderTasks();
        setupEventListeners();
    }

    // --- THEME ENGINE (DARK / LIGHT MODE) ---
    function initTheme() {
        const savedTheme = localStorage.getItem('taskarcade_theme') || 'dark';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskarcade_theme', theme);
        if (theme === 'light') {
            themeIcon.className = 'fa-solid fa-moon';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
        }
    }

    btnToggleTheme.addEventListener('click', () => {
        sounds.playClick();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        showToast(newTheme === 'light' ? 'Cozy Light Theme Activated ☀️' : 'Dark Gamer Theme Activated 🌙');
    });

    // --- SOUND ENGINE INTEGRATION ---
    function updateSoundIcon() {
        if (sounds.isMuted()) {
            soundIcon.className = 'fa-solid fa-volume-xmark';
        } else {
            soundIcon.className = 'fa-solid fa-volume-high';
        }
    }

    btnToggleSound.addEventListener('click', () => {
        const isMuted = sounds.toggleMute();
        updateSoundIcon();
        showToast(isMuted ? 'Sound Muted 🔇' : 'Sound Enabled 🔊');
    });

    // --- RENDER HEADER STATS ---
    function renderHeaderStats() {
        const stats = storage.stats;
        const xpNeeded = storage.getXpThreshold(stats.level);
        const xpPercentage = Math.min(100, Math.round((stats.xp / xpNeeded) * 100));

        levelDisplay.textContent = `Level ${stats.level}`;
        xpTextDisplay.textContent = `${stats.xp} / ${xpNeeded} XP`;
        xpFillBar.style.width = `${xpPercentage}%`;
        streakCount.textContent = `${stats.streak} Day Streak`;
    }

    // --- RENDER BOSS ARENA 👾 ---
    function renderBossArena() {
        const boss = storage.boss;
        bossAvatar.textContent = boss.avatar;
        bossName.innerHTML = `${boss.name} <span class="weekly-tag">Weekly Boss</span>`;
        bossDesc.textContent = boss.desc;

        const hpPercent = Math.round((boss.currentHp / boss.maxHp) * 100);
        bossHpFill.style.width = `${hpPercent}%`;

        // Render ASCII HP Bar Gauge (████████░░ 80%)
        const totalBlocks = 10;
        const filledBlocks = Math.ceil((hpPercent / 100) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        const asciiString = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

        hpAsciiText.textContent = `${asciiString} ${hpPercent}% (${boss.currentHp}/${boss.maxHp} HP)`;

        if (boss.defeated) {
            bossDefeatedBanner.style.display = 'flex';
            bossHpFill.style.background = '#34d399';
        } else {
            bossDefeatedBanner.style.display = 'none';
            bossHpFill.style.background = 'linear-gradient(90deg, #f472b6, #c084fc, #38bdf8)';
        }
    }

    // --- RENDER METRICS ---
    function renderMetrics() {
        const tasks = storage.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        statTotalTasks.textContent = total;
        statCompletedTasks.textContent = completed;
        statPendingTasks.textContent = pending;
        statCompletionRate.textContent = `${rate}%`;
    }

    // --- RENDER TASKS ---
    function renderTasks() {
        let tasks = [...storage.getTasks()];

        // 1. Search Filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            tasks = tasks.filter(t => 
                t.title.toLowerCase().includes(query) || 
                (t.description && t.description.toLowerCase().includes(query))
            );
        }

        // 2. Status / Priority Filter Pills
        if (currentFilter === 'pending') {
            tasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            tasks = tasks.filter(t => t.completed);
        } else if (currentFilter === 'high') {
            tasks = tasks.filter(t => t.priority === 'high');
        } else if (currentFilter === 'medium') {
            tasks = tasks.filter(t => t.priority === 'medium');
        } else if (currentFilter === 'low') {
            tasks = tasks.filter(t => t.priority === 'low');
        }

        // 3. Category Filter
        if (currentCategory !== 'all') {
            tasks = tasks.filter(t => t.category === currentCategory);
        }

        // 4. Sorting Options
        if (currentSort === 'newest') {
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (currentSort === 'oldest') {
            tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (currentSort === 'due-date') {
            tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        } else if (currentSort === 'priority') {
            const priorityMap = { high: 3, medium: 2, low: 1 };
            tasks.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
        }

        // 5. Container View Mode
        tasksContainer.className = `tasks-container ${viewMode}`;

        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎮</div>
                    <h3>No Arcade Tasks Found</h3>
                    <p>${searchQuery ? 'No tasks match your search filter.' : 'Your task log is clear! Add a new task to earn XP and slay Zephyrus.'}</p>
                </div>
            `;
            return;
        }

        tasksContainer.innerHTML = tasks.map(task => createTaskCardHTML(task)).join('');
    }

    // --- CREATE TASK CARD HTML ---
    function createTaskCardHTML(task) {
        const themeClass = `theme-${task.color || 'violet'}`;
        const completedClass = task.completed ? 'completed' : '';

        let dueBadgeHTML = '';
        if (task.dueDate) {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = task.dueDate < today && !task.completed;
            const isToday = task.dueDate === today && !task.completed;

            let dueLabel = task.dueDate;
            let dueClass = 'due-pill';

            if (isToday) {
                dueLabel = 'Due Today';
                dueClass += ' today';
            } else if (isOverdue) {
                dueLabel = `Overdue (${task.dueDate})`;
                dueClass += ' overdue';
            }

            dueBadgeHTML = `
                <div class="${dueClass}">
                    <i class="fa-regular fa-calendar"></i> ${dueLabel}
                </div>
            `;
        }

        return `
            <div class="task-card ${themeClass} ${completedClass}" data-id="${task.id}">
                <div class="card-header-row">
                    <div class="custom-checkbox" onclick="window.toggleTaskComplete('${task.id}', event)">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <div class="task-main-info">
                        <div class="task-title">${escapeHTML(task.title)}</div>
                        ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
                    </div>
                </div>

                <div class="card-meta-row">
                    <div class="meta-tags">
                        <span class="badge-priority ${task.priority}">${task.priority}</span>
                        <span class="badge-category">${task.category}</span>
                        ${dueBadgeHTML}
                    </div>
                    <div class="card-actions">
                        <button class="action-btn edit" onclick="window.openEditTaskModal('${task.id}')" title="Edit Task">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="action-btn delete" onclick="window.confirmDeleteTask('${task.id}')" title="Delete Task">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // --- TOGGLE TASK COMPLETE & GAMIFICATION EFFECTS ---
    window.toggleTaskComplete = function(taskId, event) {
        sounds.playClick();
        const result = storage.toggleTaskComplete(taskId);
        if (!result) return;

        const { task, xpGained, bossDamage, levelUpResult, bossResult } = result;

        if (task.completed) {
            sounds.playTaskComplete();
            sounds.playBossHit();

            if (event) {
                spawnFloatingXP(`+${xpGained} XP!`, event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2);
            }

            bossArena.classList.add('damage-flash');
            setTimeout(() => bossArena.classList.remove('damage-flash'), 400);

            if (levelUpResult && levelUpResult.leveledUp) {
                sounds.playLevelUp();
                triggerConfetti();
                showToast(`🎉 LEVEL UP! You reached Level ${levelUpResult.newLevel}!`);
            }

            if (bossResult && bossResult.newlyDefeated) {
                sounds.playBossDefeated();
                triggerConfetti(true);
                showToast(`🏆 VICTORY! You defeated ${storage.boss.name}! Earned +300 Bonus XP!`);
            }
        }

        renderHeaderStats();
        renderBossArena();
        renderMetrics();
        renderTasks();
    };

    function spawnFloatingXP(text, x, y) {
        const elem = document.createElement('div');
        elem.className = 'floating-xp';
        elem.textContent = text;
        elem.style.left = `${x - 20}px`;
        elem.style.top = `${y - 30}px`;
        document.body.appendChild(elem);

        setTimeout(() => elem.remove(), 1200);
    }

    function triggerConfetti(epic = false) {
        if (typeof confetti !== 'function') return;
        if (epic) {
            confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
        } else {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
    }

    // --- MODAL ACTIONS ---
    function openAddModal() {
        sounds.playClick();
        modalTitleText.textContent = 'Add New Task';
        modalTaskId.value = '';
        taskTitleInput.value = '';
        taskDescInput.value = '';
        taskPriorityInput.value = 'medium';
        taskCategoryInput.value = 'Personal';
        taskDueInput.value = '';
        setSelectedColorSwatch('violet');
        taskModal.classList.add('active');
        taskTitleInput.focus();
    }

    window.openEditTaskModal = function(taskId) {
        sounds.playClick();
        const task = storage.getTasks().find(t => t.id === taskId);
        if (!task) return;

        modalTitleText.textContent = 'Edit Task';
        modalTaskId.value = task.id;
        taskTitleInput.value = task.title;
        taskDescInput.value = task.description || '';
        taskPriorityInput.value = task.priority;
        taskCategoryInput.value = task.category;
        taskDueInput.value = task.dueDate || '';
        setSelectedColorSwatch(task.color || 'violet');

        taskModal.classList.add('active');
    };

    function closeTaskModal() {
        sounds.playClick();
        taskModal.classList.remove('active');
    }

    function setSelectedColorSwatch(color) {
        selectedColor = color;
        const swatches = colorSwatchesContainer.querySelectorAll('.swatch-btn');
        swatches.forEach(s => {
            if (s.dataset.color === color) {
                s.classList.add('selected');
            } else {
                s.classList.remove('selected');
            }
        });
    }

    colorSwatchesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.swatch-btn');
        if (btn && btn.dataset.color) {
            sounds.playClick();
            setSelectedColorSwatch(btn.dataset.color);
        }
    });

    btnSaveTask.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        if (!title) {
            showToast('⚠️ Task title is required!');
            taskTitleInput.focus();
            return;
        }

        const taskData = {
            title,
            description: taskDescInput.value.trim(),
            priority: taskPriorityInput.value,
            category: taskCategoryInput.value,
            dueDate: taskDueInput.value,
            color: selectedColor
        };

        const editingId = modalTaskId.value;
        if (editingId) {
            storage.updateTask(editingId, taskData);
            showToast('Task updated! ✏️');
        } else {
            storage.addTask(taskData);
            showToast('New task added to Arcade! 🕹️');
        }

        closeTaskModal();
        renderMetrics();
        renderTasks();
    });

    // --- DELETE TASK CONFIRMATION ---
    window.confirmDeleteTask = function(taskId) {
        sounds.playClick();
        deletingTaskId = taskId;
        deleteModal.classList.add('active');
    };

    btnCancelDelete.addEventListener('click', () => {
        sounds.playClick();
        deletingTaskId = null;
        deleteModal.classList.remove('active');
    });

    btnConfirmDelete.addEventListener('click', () => {
        if (deletingTaskId) {
            sounds.playDelete();
            const allTasks = storage.getTasks();
            const index = allTasks.findIndex(t => t.id === deletingTaskId);
            lastDeletedIndex = index;
            lastDeletedTask = storage.deleteTask(deletingTaskId);

            deletingTaskId = null;
            deleteModal.classList.remove('active');

            renderMetrics();
            renderTasks();

            showUndoToast('Task deleted');
        }
    });

    function showUndoToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-undo-btn" onclick="window.undoLastDelete(this)">Undo</button>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 4000);
    }

    window.undoLastDelete = function(btnElem) {
        if (lastDeletedTask) {
            storage.restoreTask(lastDeletedTask, lastDeletedIndex);
            lastDeletedTask = null;
            lastDeletedIndex = -1;
            renderMetrics();
            renderTasks();
            showToast('Task restored! 🔄');
        }
        if (btnElem && btnElem.parentNode) {
            btnElem.parentNode.remove();
        }
    };

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }

    // --- SETUP EVENT LISTENERS ---
    function setupEventListeners() {
        btnOpenAddModal.addEventListener('click', openAddModal);
        btnCloseTaskModal.addEventListener('click', closeTaskModal);
        btnCancelTaskModal.addEventListener('click', closeTaskModal);

        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTasks();
        });

        const filterPillsContainer = document.getElementById('filter-pills-container');
        filterPillsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-pill');
            if (!btn) return;

            sounds.playClick();
            filterPillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });

        categorySelect.addEventListener('change', (e) => {
            sounds.playClick();
            currentCategory = e.target.value;
            renderTasks();
        });

        sortSelect.addEventListener('change', (e) => {
            sounds.playClick();
            currentSort = e.target.value;
            renderTasks();
        });

        viewGridBtn.addEventListener('click', () => {
            sounds.playClick();
            viewMode = 'grid';
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            renderTasks();
        });

        viewListBtn.addEventListener('click', () => {
            sounds.playClick();
            viewMode = 'list';
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            renderTasks();
        });
    }

    initApp();
});
