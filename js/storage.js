/* ============================================
   STORAGE.JS - Fallback localStorage para ECO
   ============================================ */

const storage = {
    KEYS: {
        USERS: 'eco_users',
        CURRENT_USER: 'eco_current_user',
        SETTINGS: 'eco_settings'
    },

    init() {
        if (!localStorage.getItem(this.KEYS.USERS)) {
            localStorage.setItem(this.KEYS.USERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({ volume: 0.8, vibration: true }));
        }
        console.log('✅ Storage inicializado');
        return true;
    },

    getUsers() {
        try {
            const u = localStorage.getItem(this.KEYS.USERS);
            return u ? JSON.parse(u) : [];
        } catch(e) { return []; }
    },

    getUser(userId) {
        return this.getUsers().find(u => u.id === userId) || null;
    },

    saveUser(user) {
        try {
            const users = this.getUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) users[idx] = user;
            else users.push(user);
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            return true;
        } catch(e) { return false; }
    },

    deleteUser(userId) {
        const users = this.getUsers().filter(u => u.id !== userId);
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    getCurrentUser() {
        const id = localStorage.getItem(this.KEYS.CURRENT_USER);
        return id ? this.getUser(id) : null;
    },

    setCurrentUser(userId) {
        localStorage.setItem(this.KEYS.CURRENT_USER, userId);
    },

    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    getSettings() {
        try {
            const s = localStorage.getItem(this.KEYS.SETTINGS);
            return s ? JSON.parse(s) : { volume: 0.8 };
        } catch(e) { return { volume: 0.8 }; }
    },

    updateSettings(settings) {
        try {
            const current = this.getSettings();
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({...current, ...settings}));
            return true;
        } catch(e) { return false; }
    },

    updateUserProgress(userId, vocal, activityIndex, completed) {
        const user = this.getUser(userId);
        if (!user) return false;
        if (!user.progress) user.progress = {};
        if (!user.progress[vocal]) user.progress[vocal] = { completed: 0, stars: 0 };
        if (completed) {
            user.progress[vocal].completed = Math.max(user.progress[vocal].completed, activityIndex + 1);
            user.progress[vocal].stars = Math.min((user.progress[vocal].stars || 0) + 1, 4);
        }
        return this.saveUser(user);
    }
};

// Alias para compatibilidad (el código viejo usaba Storage con mayúscula)
window.Storage_ECO = storage;
window.storage = storage;

storage.init();
