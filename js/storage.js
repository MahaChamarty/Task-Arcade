/**
 * LocalStorage & Data Layer for TaskArcade
 * Handles Task CRUD operations, XP/Level progression, Daily Streaks, and Weekly Boss Battles.
 */

const STORAGE_KEYS = {
    TASKS: 'taskarcade_tasks',
    STATS: 'taskarcade_user_stats',
    BOSS: 'taskarcade_boss_state'
};

// Initial Sample Tasks for first time users
const INITIAL_TASKS = [
    {
        id: 'sample-1',
        title: 'Defeat your first task to strike Zephyrus 🐉',
        description: 'Check this box to deal 150 Critical Damage to Zephyrus the Procrastination Dragon and earn +50 XP!',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'high',
        category: 'Work',
        color: 'violet',
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'sample-2',
        title: 'Plan weekly study & coding goals',
        description: 'Break down projects into small cozy daily tasks.',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        priority: 'medium',
        category: 'Study',
        color: 'cyan',
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'sample-3',
        title: 'Cozy coffee break & grocery run',
        description: 'Apples, matcha powder, oats, and almond milk.',
        dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        priority: 'low',
        category: 'Shopping',
        color: 'rose',
        completed: false,
        createdAt: new Date().toISOString()
    }
];

// Boss Roster featuring Zephyrus as the primary dragon!
const BOSS_ROSTER = [
    { name: 'Zephyrus the Procrastination Dragon', avatar: '🐉', maxHp: 600, desc: 'Breathes flames of delay and distraction!' },
    { name: 'Vortex the Chaos Monster', avatar: '👾', maxHp: 750, desc: 'Feeds on clutter and messy to-do lists!' },
    { name: 'Malakor the Distraction Shadow', avatar: '👹', maxHp: 900, desc: 'Lures brave warriors into endless doom-scrolling!' },
    { name: 'Giga-Bug the Code Destroyer', avatar: '🤖', maxHp: 1000, desc: 'Injects syntax errors into your productive day!' }
];

class StorageManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.stats = this.loadStats();
        this.boss = this.loadBoss();
        this.checkStreak();
    }

    // --- TASKS ---
    loadTasks() {
        const data = localStorage.getItem(STORAGE_KEYS.TASKS) || localStorage.getItem('questdo_tasks');
        if (!data) {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
            return [...INITIAL_TASKS];
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            return [...INITIAL_TASKS];
        }
    }

    saveTasks() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
    }

    getTasks() {
        return this.tasks;
    }

    addTask(taskData) {
        const newTask = {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title: taskData.title.trim(),
            description: (taskData.description || '').trim(),
            dueDate: taskData.dueDate || '',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'Personal',
            color: taskData.color || 'violet',
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        this.tasks.unshift(newTask);
        this.saveTasks();
        return newTask;
    }

    updateTask(id, updatedData) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                title: updatedData.title.trim(),
                description: (updatedData.description || '').trim(),
                dueDate: updatedData.dueDate || '',
                priority: updatedData.priority || 'medium',
                category: updatedData.category || 'Personal',
                color: updatedData.color || 'violet'
            };
            this.saveTasks();
            return this.tasks[index];
        }
        return null;
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return null;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        this.saveTasks();

        let xpGained = 0;
        let bossDamage = 0;
        let levelUpResult = null;
        let bossResult = null;

        if (task.completed) {
            // Calculate XP (Base 50 + Priority bonus)
            xpGained = 50;
            if (task.priority === 'high') xpGained += 30;
            else if (task.priority === 'medium') xpGained += 15;

            // Damage to Boss
            bossDamage = 50;
            if (task.priority === 'high') bossDamage = 150;
            else if (task.priority === 'medium') bossDamage = 85;

            levelUpResult = this.addXP(xpGained);
            bossResult = this.damageBoss(bossDamage);
            this.updateActiveStreak();
            this.checkBadges();
        } else {
            // Revert XP & Boss HP if unchecked
            xpGained = -50;
            if (task.priority === 'high') xpGained -= 30;
            else if (task.priority === 'medium') xpGained -= 15;

            bossDamage = -50;
            if (task.priority === 'high') bossDamage = -150;
            else if (task.priority === 'medium') bossDamage = -85;

            this.addXP(xpGained);
            this.healBoss(Math.abs(bossDamage));
        }

        return {
            task,
            xpGained,
            bossDamage,
            levelUpResult,
            bossResult
        };
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            const deleted = this.tasks.splice(index, 1)[0];
            this.saveTasks();
            return deleted;
        }
        return null;
    }

    restoreTask(task, originalIndex) {
        if (originalIndex !== undefined && originalIndex < this.tasks.length) {
            this.tasks.splice(originalIndex, 0, task);
        } else {
            this.tasks.push(task);
        }
        this.saveTasks();
    }

    // --- USER STATS, XP & STREAK ---
    loadStats() {
        const data = localStorage.getItem(STORAGE_KEYS.STATS) || localStorage.getItem('questdo_user_stats');
        const defaultStats = {
            xp: 0,
            level: 1,
            streak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            unlockedBadges: ['rookie_starter']
        };
        if (!data) {
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats));
            return defaultStats;
        }
        try {
            return { ...defaultStats, ...JSON.parse(data) };
        } catch (e) {
            return defaultStats;
        }
    }

    saveStats() {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
    }

    getXpThreshold(level) {
        return level * 150;
    }

    addXP(amount) {
        this.stats.xp = Math.max(0, this.stats.xp + amount);
        let currentLevel = this.stats.level;
        let xpNeeded = this.getXpThreshold(currentLevel);
        let leveledUp = false;

        while (this.stats.xp >= xpNeeded) {
            this.stats.level++;
            currentLevel = this.stats.level;
            xpNeeded = this.getXpThreshold(currentLevel);
            leveledUp = true;
        }

        this.saveStats();
        return {
            leveledUp,
            newLevel: this.stats.level,
            xp: this.stats.xp,
            xpNeeded: this.getXpThreshold(this.stats.level)
        };
    }

    checkStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = this.stats.lastActiveDate;

        if (!lastActive) {
            this.stats.lastActiveDate = today;
            this.stats.streak = 1;
            this.saveStats();
            return;
        }

        const todayDate = new Date(today);
        const lastDate = new Date(lastActive);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            this.stats.streak = 1;
            this.stats.lastActiveDate = today;
            this.saveStats();
        }
    }

    updateActiveStreak() {
        const today = new Date().toISOString().split('T')[0];
        if (this.stats.lastActiveDate !== today) {
            const todayDate = new Date(today);
            const lastDate = new Date(this.stats.lastActiveDate);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.stats.streak += 1;
            } else {
                this.stats.streak = 1;
            }
            this.stats.lastActiveDate = today;
            this.saveStats();
        }
    }

    // --- WEEKLY BOSS BATTLES 👾 ---
    loadBoss() {
        const data = localStorage.getItem(STORAGE_KEYS.BOSS) || localStorage.getItem('questdo_boss_state');
        const currentWeekId = this.getWeekIdentifier();

        if (data) {
            try {
                const boss = JSON.parse(data);
                if (boss.weekId === currentWeekId && boss.name.includes('Zephyrus')) {
                    return boss;
                }
            } catch (e) { }
        }

        // Set Zephyrus as primary featured boss!
        const template = BOSS_ROSTER[0];
        const newBoss = {
            id: 'boss_' + currentWeekId,
            name: template.name,
            avatar: template.avatar,
            desc: template.desc,
            maxHp: template.maxHp,
            currentHp: template.maxHp,
            defeated: false,
            weekId: currentWeekId
        };
        localStorage.setItem(STORAGE_KEYS.BOSS, JSON.stringify(newBoss));
        return newBoss;
    }

    getWeekIdentifier() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${weekNo}`;
    }

    saveBoss() {
        localStorage.setItem(STORAGE_KEYS.BOSS, JSON.stringify(this.boss));
    }

    damageBoss(damageAmount) {
        if (this.boss.defeated) return { defeated: false, newlyDefeated: false };

        const previousHp = this.boss.currentHp;
        this.boss.currentHp = Math.max(0, this.boss.currentHp - damageAmount);

        let newlyDefeated = false;
        if (this.boss.currentHp === 0 && !this.boss.defeated) {
            this.boss.defeated = true;
            newlyDefeated = true;
            this.addXP(300);
            if (!this.stats.unlockedBadges.includes('dragon_slayer')) {
                this.stats.unlockedBadges.push('dragon_slayer');
                this.saveStats();
            }
        }

        this.saveBoss();
        return {
            damage: damageAmount,
            previousHp,
            currentHp: this.boss.currentHp,
            maxHp: this.boss.maxHp,
            defeated: this.boss.defeated,
            newlyDefeated
        };
    }

    healBoss(healAmount) {
        if (this.boss.defeated) {
            this.boss.defeated = false;
        }
        this.boss.currentHp = Math.min(this.boss.maxHp, this.boss.currentHp + healAmount);
        this.saveBoss();
    }

    checkBadges() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        const newBadges = [];

        if (completedCount >= 1 && !this.stats.unlockedBadges.includes('first_task')) {
            newBadges.push('first_task');
            this.stats.unlockedBadges.push('first_task');
        }
        if (completedCount >= 5 && !this.stats.unlockedBadges.includes('high_five')) {
            newBadges.push('high_five');
            this.stats.unlockedBadges.push('high_five');
        }
        if (completedCount >= 10 && !this.stats.unlockedBadges.includes('task_master')) {
            newBadges.push('task_master');
            this.stats.unlockedBadges.push('task_master');
        }

        if (newBadges.length > 0) {
            this.saveStats();
        }
        return newBadges;
    }
}

const storage = new StorageManager();
