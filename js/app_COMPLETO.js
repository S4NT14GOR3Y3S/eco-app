/* ============================================
   APP.JS - ECO (REGISTRO COMPLETO)
   ============================================ */

const app = {
    currentUser: null,
    currentVocal: null,
    currentGameVocal: null,
    selectedAvatar: '👦',

    // ─── INICIO ───────────────────────────────
    init() {
        console.log('🦜 Iniciando ECO...');
        setTimeout(() => this.checkFirstTime(), 2000);
    },

    checkFirstTime() {
        let users = [];
        try {
            users = (typeof database !== 'undefined' && database.initialized)
                ? database.getAllUsers()
                : storage.getUsers();
        } catch(e) {
            try { users = storage.getUsers(); } catch(e2) { users = []; }
        }
        console.log('👥 Usuarios:', users.length);
        // Si no hay usuarios → bienvenida, si hay → login
        this.goToScreen(users.length > 0 ? 'login-screen' : 'welcome-screen');
    },

    // ─── NAVEGACIÓN ───────────────────────────
    goToScreen(screenId) {
        console.log('📱 →', screenId);
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            if (screenId === 'login-screen')  this.renderLoginProfiles();
            if (screenId === 'menu-screen')   this.updateMenu();
            if (screenId === 'register-screen') this.resetRegisterForm();
        }
    },

    // ─── REGISTRO ─────────────────────────────
    resetRegisterForm() {
        const nameInput = document.getElementById('reg-name');
        if (nameInput) nameInput.value = '';
        // Seleccionar primer avatar por defecto
        this.selectAvatar('👦', document.querySelector('.avatar-option'));
        this.updateRegisterBtn();
    },

    selectAvatar(emoji, el) {
        this.selectedAvatar = emoji;
        // Quitar selección anterior
        document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
        if (el) el.classList.add('selected');
        this.updateRegisterPreview();
    },

    onNameInput(value) {
        this.updateRegisterPreview();
        this.updateRegisterBtn();
    },

    updateRegisterPreview() {
        const name = (document.getElementById('reg-name')?.value || '').trim();
        const preview = document.getElementById('reg-preview');
        const previewAvatar = document.getElementById('reg-preview-avatar');
        const previewName = document.getElementById('reg-preview-name');

        if (name.length > 0 && preview) {
            preview.style.display = 'block';
            if (previewAvatar) previewAvatar.textContent = this.selectedAvatar;
            if (previewName)   previewName.textContent   = name;
        } else if (preview) {
            preview.style.display = 'none';
        }
    },

    updateRegisterBtn() {
        const name = (document.getElementById('reg-name')?.value || '').trim();
        const btn  = document.getElementById('reg-btn');
        if (!btn) return;
        if (name.length >= 2) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        } else {
            btn.style.opacity = '0.4';
            btn.style.pointerEvents = 'none';
        }
    },

    createUser() {
        const name = (document.getElementById('reg-name')?.value || '').trim();
        if (name.length < 2) {
            this.showMessage('✏️ Escribe tu nombre (mínimo 2 letras)');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            avatar: this.selectedAvatar,
            createdAt: new Date().toISOString(),
            currentLevel: 1,
            progress: {
                a: { completed: 0, stars: 0 },
                e: { completed: 0, stars: 0 },
                i: { completed: 0, stars: 0 },
                o: { completed: 0, stars: 0 },
                u: { completed: 0, stars: 0 }
            }
        };

        try {
            if (typeof database !== 'undefined' && database.initialized) {
                const uid = database.createUser(name, this.selectedAvatar, null);
                this.currentUser = database.getUser(uid) || newUser;
                this.currentUser.progress = newUser.progress;
            } else {
                storage.saveUser(newUser);
                this.currentUser = newUser;
            }
        } catch(e) {
            storage.saveUser(newUser);
            this.currentUser = newUser;
        }

        console.log('✅ Usuario creado:', name);
        this.showCelebration('¡Hola ' + name + '! ' + this.selectedAvatar + ' ¡Bienvenido a ECO!');
        setTimeout(() => {
            this.closeModal();
            this.goToScreen('menu-screen');
        }, 2500);
    },

    // ─── LOGIN ────────────────────────────────
    renderLoginProfiles() {
        const container = document.getElementById('profiles-container');
        if (!container) return;

        let users = [];
        try {
            users = (typeof database !== 'undefined' && database.initialized)
                ? database.getAllUsers()
                : storage.getUsers();
        } catch(e) { try { users = storage.getUsers(); } catch(e2) {} }

        if (users.length === 0) {
            container.innerHTML = '<p style="color:#999;text-align:center;padding:1rem;">Sin perfiles aún</p>';
            return;
        }

        container.innerHTML = users.map(u => {
            const prog = u.progress || {};
            let total = 0;
            ['a','e','i','o','u'].forEach(v => { total += (prog[v]?.stars || 0); });
            return `
                <button class="profile-card-btn" onclick="app.loginAs('${u.id}')">
                    <div class="profile-avatar-big">${u.avatar || '👦'}</div>
                    <div class="profile-name-big">${u.name}</div>
                    <div class="profile-level">⭐ ${total} estrellas</div>
                </button>`;
        }).join('');
    },

    loginAs(userId) {
        let user;
        try {
            user = (typeof database !== 'undefined' && database.initialized)
                ? database.getUser(userId)
                : storage.getUser(userId);
        } catch(e) { user = storage.getUser(userId); }

        if (!user) { this.showMessage('❌ Usuario no encontrado'); return; }

        this.currentUser = user;
        console.log('👤 Login:', user.name);
        this.showCelebration('¡Hola de nuevo, ' + user.name + '! ' + (user.avatar || ''));
        setTimeout(() => {
            this.closeModal();
            this.goToScreen('menu-screen');
        }, 1800);
    },

    logout() {
        this.currentUser = null;
        this.goToScreen('login-screen');
    },

    // ─── MENÚ ─────────────────────────────────
    updateMenu() {
        if (!this.currentUser) { this.goToScreen('login-screen'); return; }

        const g = document.getElementById('user-greeting');
        if (g) g.textContent = '¡Hola, ' + this.currentUser.name + '!';

        try {
            if (typeof levels !== 'undefined') levels.updateLevelBadge(this.currentUser.id);
        } catch(e) {}

        this.refreshProgress();
    },

    refreshProgress() {
        if (!this.currentUser) return;

        let prog = {};
        try {
            prog = (typeof database !== 'undefined' && database.initialized)
                ? database.getUserProgress(this.currentUser.id)
                : (this.currentUser.progress || {});
        } catch(e) { prog = this.currentUser.progress || {}; }

        let totalComp = 0;
        ['a','e','i','o','u'].forEach(v => {
            const p = Array.isArray(prog[v]) ? prog[v][0] : prog[v];
            const stars = p?.stars || 0;
            const comp  = p?.completed || 0;
            totalComp += comp;

            // Actualizar estrellas en la tarjeta
            const starsEl = document.getElementById('stars-' + v);
            if (starsEl) starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(4 - stars);

            const progEl = document.getElementById('prog-' + v);
            if (progEl) progEl.textContent = comp + ' / 4 actividades';
        });

        // Barra de progreso
        const pct = Math.round((totalComp / 20) * 100);
        const bar = document.getElementById('overall-progress');
        if (bar) {
            bar.style.width = pct + '%';
            const span = bar.querySelector('.progress-pct');
            if (span) span.textContent = pct + '%';
        }
    },

    // ─── ACTIVIDADES ──────────────────────────
    startVocal(vocal) {
        if (!this.currentUser) {
            this.showMessage('👆 Primero regístrate o elige tu perfil');
            setTimeout(() => this.goToScreen('login-screen'), 1500);
            return;
        }
        if (typeof activities === 'undefined') {
            this.showMessage('❌ Error cargando actividades');
            return;
        }
        this.currentVocal = vocal;
        activities.start(vocal);
    },

    // ─── JUEGOS ───────────────────────────────
    showGamesMenu() {
        if (!this.currentUser) { this.showMessage('👆 Regístrate primero'); return; }
        this.goToScreen('games-menu-screen');
    },

    selectGameVocal(v) {
        this.currentGameVocal = v;
        this.goToScreen('game-select-screen');
    },

    startGame(type) {
        if (!this.currentGameVocal) return;
        if (type === 'connect') games.renderConnectGame(this.currentGameVocal);
        else if (type === 'coloring') games.renderColoringGame(this.currentGameVocal);
    },

    // ─── DIPLOMA / NIVELES ────────────────────
    checkDiploma() {
        if (!this.currentUser) return;
        const cert = typeof certificate !== 'undefined' ? certificate : null;
        if (cert) cert.checkAndShow(this.currentUser.id);
        else this.showMessage('🎓 Completa actividades para tu diploma');
    },

    showLevels() {
        if (!this.currentUser) return;
        if (typeof levels !== 'undefined') levels.renderLevelsScreen(this.currentUser.id);
    },

    // ─── MODAL ────────────────────────────────
    showCelebration(msg) {
        const modal = document.getElementById('celebration-modal');
        const msgEl = document.getElementById('modal-message');
        if (modal) {
            if (msgEl) msgEl.textContent = msg;
            modal.classList.add('active');
        }
    },

    closeModal() {
        const modal = document.getElementById('celebration-modal');
        if (modal) modal.classList.remove('active');
    },

    // ─── TOAST ────────────────────────────────
    showMessage(msg) {
        const old = document.querySelector('.eco-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'eco-toast';
        t.textContent = msg;
        t.style.cssText = [
            'position:fixed', 'top:24px', 'left:50%', 'transform:translateX(-50%)',
            'background:#333', 'color:white', 'padding:1rem 2rem',
            'border-radius:14px', 'font-weight:700', 'font-size:1.1rem',
            'z-index:99999', 'box-shadow:0 4px 20px rgba(0,0,0,0.35)',
            'max-width:90vw', 'text-align:center'
        ].join(';');
        document.body.appendChild(t);
        setTimeout(() => {
            t.style.transition = 'opacity .3s';
            t.style.opacity = '0';
            setTimeout(() => t.remove(), 300);
        }, 2500);
    },

    showProgress() { this.showLevels(); }
};

// ─── ARRANQUE ─────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
window.app = app;
