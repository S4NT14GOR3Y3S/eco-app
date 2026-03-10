/* ============================================
   APP.JS v3 - RECONOCIMIENTO FACIAL CORREGIDO
   + GUARDADO Y CARGA DE PROGRESO REAL
   ============================================ */

const app = {
    currentUser: null,
    currentVocal: null,
    currentGameVocal: null,
    selectedAvatar: '👦',
    faceRecognitionActive: false,

    init() {
        console.log('🦜 Iniciando ECO v3...');
        // Inicializar storage
        try { storage.init(); } catch(e) {}
        setTimeout(() => this.checkFirstTime(), 2200);
    },

    checkFirstTime() {
        // Verificar si hay sesión activa guardada
        try {
            const savedId = localStorage.getItem('eco_current_session');
            if (savedId) {
                const savedUser = storage.getUser(savedId);
                if (savedUser) {
                    console.log('🔄 Sesión restaurada:', savedUser.name);
                    this.currentUser = savedUser;
                    this.goToScreen('menu-screen');
                    return;
                }
            }
        } catch(e) {}

        // Sin sesión activa: ver si hay usuarios registrados
        let users = [];
        try { users = storage.getUsers() || []; } catch(e) {}
        console.log('👥 Usuarios registrados:', users.length);
        this.goToScreen(users.length > 0 ? 'login-screen' : 'welcome-screen');
    },

    goToScreen(screenId) {
        console.log('📱 →', screenId);

        // Detener cámara si salimos de login o register
        const currentActive = document.querySelector('.screen.active');
        if (currentActive) {
            const wasLogin = currentActive.id === 'login-screen';
            const wasRegister = currentActive.id === 'register-screen';
            if ((wasLogin || wasRegister) && screenId !== 'login-screen' && screenId !== 'register-screen') {
                faceRecognition.stop();
            }
        }

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            if (screenId === 'login-screen')    this.initLoginWithFace();
            if (screenId === 'menu-screen')     this.updateMenu();
            if (screenId === 'register-screen') this.resetRegisterForm();
        }
    },

    // ═══════════════════════════════════════════
    // REGISTRO
    // ═══════════════════════════════════════════
    resetRegisterForm() {
        const nameInput = document.getElementById('reg-name');
        if (nameInput) nameInput.value = '';
        this.selectedAvatar = '👦';
        const first = document.querySelector('.avatar-option');
        document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
        if (first) first.classList.add('selected');
        this.updateRegisterPreview();
        this.updateRegisterBtn();

        // Iniciar cámara en el video de registro (ID único)
        setTimeout(async () => {
            await faceRecognition.init('register-face-video', 'register-face-canvas', null);
        }, 400);
    },

    selectAvatar(emoji, el) {
        this.selectedAvatar = emoji;
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
        if (preview) {
            preview.style.display = name.length > 0 ? 'block' : 'none';
            const pa = document.getElementById('reg-preview-avatar');
            const pn = document.getElementById('reg-preview-name');
            if (pa) pa.textContent = this.selectedAvatar;
            if (pn) pn.textContent = name;
        }
    },

    updateRegisterBtn() {
        const name = (document.getElementById('reg-name')?.value || '').trim();
        const btn = document.getElementById('reg-btn');
        if (!btn) return;
        const ok = name.length >= 2;
        btn.style.opacity = ok ? '1' : '0.4';
        btn.style.pointerEvents = ok ? 'auto' : 'none';
    },

    async createUser() {
        const name = (document.getElementById('reg-name')?.value || '').trim();
        if (name.length < 2) { this.showMessage('✏️ Escribe tu nombre (mínimo 2 letras)'); return; }

        const btn = document.getElementById('reg-btn');
        if (btn) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }

        try {
            this.showMessage('📸 Capturando tu foto...');
            this.currentUser = await faceRecognition.registerFace(name, this.selectedAvatar);
            console.log('✅ Usuario creado:', name);

            // Guardar sesión activa
            localStorage.setItem('eco_current_session', this.currentUser.id);

            this.showCelebration('¡Hola ' + name + '! ' + this.selectedAvatar);
            setTimeout(() => {
                this.closeModal();
                faceRecognition.stop();
                this.goToScreen('menu-screen');
            }, 2500);
        } catch(e) {
            console.error('Error creando usuario:', e);
            if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
            this.showMessage('❌ ' + (e.message || 'Error al registrar. Inténtalo de nuevo.'));
        }
    },

    // ═══════════════════════════════════════════
    // LOGIN CON RECONOCIMIENTO FACIAL
    // ═══════════════════════════════════════════
    async initLoginWithFace() {
        this.faceRecognitionActive = true;
        this.renderLoginProfiles();

        // Iniciar cámara en el video del login (ID único)
        const ok = await faceRecognition.init('login-face-video', 'login-face-canvas', 'face-scan-indicator');
        if (!ok) {
            const ind = document.getElementById('face-scan-indicator');
            if (ind) ind.textContent = '👆 Toca tu perfil para entrar';
            return;
        }

        if (!this.faceRecognitionActive) return; // Salimos de la pantalla durante carga

        // Arrancar escaneo continuo
        faceRecognition.startAutoRecognition(
            'login-face-video',
            'login-face-canvas',
            'face-scan-indicator',
            (matchedUser) => {
                if (this.faceRecognitionActive) {
                    this.loginAs(matchedUser.id, true);
                }
            },
            1800
        );
    },

    renderLoginProfiles() {
        const container = document.getElementById('profiles-container');
        if (!container) return;
        let users = [];
        try { users = storage.getUsers() || []; } catch(e) {}

        if (users.length === 0) {
            container.innerHTML = '<p style="color:#999;text-align:center;padding:1rem;">Sin perfiles aún</p>';
            return;
        }
        container.innerHTML = users.map(u => {
            const totalStars = u.totalStars || 0;
            const level = u.currentLevel || 1;
            return `
                <button class="profile-card-btn" onclick="app.loginAs('${u.id}', false)">
                    <div class="profile-avatar-big">${u.avatar || '👦'}</div>
                    <div class="profile-name-big">${u.name}</div>
                    <div class="profile-level">⭐ ${totalStars} estrellas · Nivel ${level}</div>
                </button>`;
        }).join('');
    },

    loginAs(userId, fromFace) {
        // Detener reconocimiento
        this.faceRecognitionActive = false;
        faceRecognition.stopAutoRecognition();

        // Cargar usuario CON su progreso guardado
        let user = null;
        try { user = storage.getUser(userId); } catch(e) {}
        if (!user) { this.showMessage('❌ Perfil no encontrado'); return; }

        // Hidratar progreso si falta alguna vocal
        if (!user.progress) user.progress = {};
        ['a','e','i','o','u'].forEach(v => {
            if (!user.progress[v]) user.progress[v] = { completed: 0, stars: 0, attempts: 0 };
        });

        this.currentUser = user;
        // Guardar sesión activa para restaurar al recargar
        try { localStorage.setItem('eco_current_session', userId); } catch(e) {}

        console.log('👤 Login:', user.name, '| Progreso:', JSON.stringify(user.progress));

        const greeting = fromFace
            ? '¡Te reconocí, ' + user.name + '! ' + (user.avatar || '')
            : '¡Hola, ' + user.name + '! ' + (user.avatar || '');
        this.showCelebration(greeting);

        setTimeout(() => {
            this.closeModal();
            faceRecognition.stop();
            this.goToScreen('menu-screen');
        }, 1800);
    },

    logout() {
        this.currentUser = null;
        this.faceRecognitionActive = false;
        faceRecognition.stop();
        // Borrar sesión guardada
        try { localStorage.removeItem('eco_current_session'); } catch(e) {}
        this.goToScreen('login-screen');
    },

    // ═══════════════════════════════════════════
    // MENÚ PRINCIPAL
    // ═══════════════════════════════════════════
    updateMenu() {
        if (!this.currentUser) { this.goToScreen('login-screen'); return; }

        // Re-cargar usuario desde storage para tener progreso actualizado
        try {
            const fresh = storage.getUser(this.currentUser.id);
            if (fresh) {
                if (!fresh.progress) fresh.progress = {};
                ['a','e','i','o','u'].forEach(v => {
                    if (!fresh.progress[v]) fresh.progress[v] = { completed: 0, stars: 0, attempts: 0 };
                });
                this.currentUser = fresh;
            }
        } catch(e) {}

        const g = document.getElementById('user-greeting');
        if (g) g.textContent = '¡Hola, ' + this.currentUser.name + '!';

        const avatarEl = document.getElementById('user-avatar-menu');
        if (avatarEl) avatarEl.textContent = this.currentUser.avatar || '👦';

        try { if (typeof levels !== 'undefined') levels.updateLevelBadge(this.currentUser.id); } catch(e) {}
        this.refreshProgress();
    },

    // Guardar progreso desde activities
    saveUserProgress(vocal, completedCount, starsCount) {
        if (!this.currentUser) return;

        if (!this.currentUser.progress) this.currentUser.progress = {};
        if (!this.currentUser.progress[vocal]) {
            this.currentUser.progress[vocal] = { completed: 0, stars: 0, attempts: 0 };
        }

        const p = this.currentUser.progress[vocal];
        p.completed = Math.max(p.completed, completedCount);
        p.stars = Math.min(Math.max(p.stars, starsCount), 4);
        p.attempts = (p.attempts || 0) + 1;

        // Recalcular total de estrellas
        let totalStars = 0;
        ['a','e','i','o','u'].forEach(v => {
            totalStars += (this.currentUser.progress[v]?.stars || 0);
        });
        this.currentUser.totalStars = totalStars;

        // Calcular nivel actual
        this.currentUser.currentLevel = this.calculateLevel(totalStars);

        // Persistir en localStorage
        try {
            storage.saveUser(this.currentUser);
            console.log(`💾 Progreso guardado: ${vocal.toUpperCase()} ${p.completed}/4 ⭐${p.stars} | Total: ⭐${totalStars}`);
        } catch(e) {
            console.error('Error guardando progreso:', e);
        }
    },

    calculateLevel(totalStars) {
        if (totalStars >= 32) return 5;
        if (totalStars >= 24) return 4;
        if (totalStars >= 16) return 3;
        if (totalStars >= 8)  return 2;
        return 1;
    },

    refreshProgress() {
        if (!this.currentUser) return;
        const prog = this.currentUser.progress || {};
        let totalComp = 0, totalStars = 0;

        ['a','e','i','o','u'].forEach(v => {
            const p = prog[v] || { completed: 0, stars: 0 };
            totalComp += p.completed;
            totalStars += p.stars;

            const starsEl = document.getElementById('stars-' + v);
            if (starsEl) starsEl.textContent = '⭐'.repeat(p.stars) + '☆'.repeat(Math.max(0, 4 - p.stars));

            const progEl = document.getElementById('prog-' + v);
            if (progEl) progEl.textContent = p.completed + ' / 4 actividades';
        });

        this.currentUser.totalStars = totalStars;
        const pct = Math.round((totalComp / 20) * 100);
        const bar = document.getElementById('overall-progress');
        if (bar) {
            bar.style.width = pct + '%';
            const span = bar.querySelector('.progress-pct');
            if (span) span.textContent = pct + '%';
        }
    },

    // ═══════════════════════════════════════════
    // NAVEGACIÓN A ACTIVIDADES Y JUEGOS
    // ═══════════════════════════════════════════
    startVocal(vocal) {
        if (!this.currentUser) {
            this.showMessage('👆 Regístrate primero');
            setTimeout(() => this.goToScreen('login-screen'), 1500);
            return;
        }
        if (typeof activities === 'undefined') { this.showMessage('❌ Error cargando actividades'); return; }
        this.currentVocal = vocal;
        activities.start(vocal);
    },

    showGamesMenu() {
        if (!this.currentUser) { this.showMessage('👆 Regístrate'); return; }
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

    checkDiploma() {
        if (!this.currentUser) return;
        if (typeof certificate !== 'undefined') certificate.checkAndShow(this.currentUser.id);
        else this.showMessage('🎓 Completa todas las actividades para tu diploma');
    },

    showLevels() {
        if (!this.currentUser) return;
        if (typeof levels !== 'undefined') levels.renderLevelsScreen(this.currentUser.id);
    },

    // ═══════════════════════════════════════════
    // UTILIDADES UI
    // ═══════════════════════════════════════════
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

    showMessage(msg) {
        const old = document.querySelector('.eco-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'eco-toast';
        t.textContent = msg;
        t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);' +
            'background:#333;color:white;padding:1rem 2rem;border-radius:14px;' +
            'font-weight:700;font-size:1.1rem;z-index:99999;' +
            'box-shadow:0 4px 20px rgba(0,0,0,0.35);max-width:90vw;text-align:center;';
        document.body.appendChild(t);
        setTimeout(() => {
            t.style.transition = 'opacity .3s'; t.style.opacity = '0';
            setTimeout(() => t.remove(), 300);
        }, 2800);
    },

    showProgress() { this.showLevels(); }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
window.app = app;
