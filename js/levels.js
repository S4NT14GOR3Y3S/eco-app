/* ============================================
   LEVELS.JS v2 - PANTALLA DE NIVELES FUNCIONAL
   ============================================ */

const levels = {
    levelsData: [
        { number: 1, name: "Exploradores",  icon: "🌱", description: "Primeros pasos con las vocales",    vocales: ["a","e"],           requiredStars: 0,  reward: "Medalla de Bronce 🥉" },
        { number: 2, name: "Aventureros",   icon: "🌟", description: "Expandiendo conocimientos",        vocales: ["a","e","i"],        requiredStars: 8,  reward: "Medalla de Plata 🥈"  },
        { number: 3, name: "Descubridores", icon: "🚀", description: "Casi todas las vocales",           vocales: ["a","e","i","o"],    requiredStars: 16, reward: "Medalla de Oro 🥇"    },
        { number: 4, name: "Maestros",      icon: "🎓", description: "Dominando todas las vocales",      vocales: ["a","e","i","o","u"], requiredStars: 24, reward: "Corona de Maestro 👑" },
        { number: 5, name: "Expertos",      icon: "⭐", description: "¡Lo lograste todo!",              vocales: ["a","e","i","o","u"], requiredStars: 32, reward: "Diploma Completo 🎓",  isDiplomaLevel: true }
    ],

    getTotalStars(userId) {
        try {
            const user = storage.getUser(userId);
            if (!user) return 0;
            let total = 0;
            Object.values(user.progress || {}).forEach(p => { total += (p.stars || 0); });
            return total;
        } catch(e) { return 0; }
    },

    getCurrentLevel(userId) {
        try {
            const user = storage.getUser(userId);
            return user?.currentLevel || 1;
        } catch(e) { return 1; }
    },

    getLevelInfo(n) {
        return this.levelsData.find(l => l.number === n) || this.levelsData[0];
    },

    isLevelUnlocked(userId, levelNumber) {
        const stars = this.getTotalStars(userId);
        const lvl = this.getLevelInfo(levelNumber);
        return lvl ? stars >= lvl.requiredStars : false;
    },

    getUserProgress(userId) {
        try {
            const user = storage.getUser(userId);
            return user?.progress || {};
        } catch(e) { return {}; }
    },

    getCompletedInLevel(userId, levelNumber) {
        const lvl = this.getLevelInfo(levelNumber);
        const prog = this.getUserProgress(userId);
        let done = 0;
        lvl.vocales.forEach(v => { done += (prog[v]?.completed || 0); });
        return done;
    },

    canAdvanceToNextLevel(userId) {
        const current = this.getCurrentLevel(userId);
        if (current >= 5) return false;
        const lvl = this.getLevelInfo(current);
        const done = this.getCompletedInLevel(userId, current);
        return done >= lvl.vocales.length * 4;
    },

    advanceLevel(userId) {
        const current = this.getCurrentLevel(userId);
        if (current >= 5) return false;
        try {
            const user = storage.getUser(userId);
            if (user) {
                user.currentLevel = current + 1;
                storage.saveUser(user);
                if (app.currentUser && app.currentUser.id === userId) {
                    app.currentUser.currentLevel = current + 1;
                }
                return true;
            }
        } catch(e) {}
        return false;
    },

    updateLevelBadge(userId) {
        const badge = document.getElementById('current-level-badge');
        if (!badge) return;
        const lvl = this.getLevelInfo(this.getCurrentLevel(userId));
        const stars = this.getTotalStars(userId);
        badge.innerHTML = `${lvl.icon} Nivel ${lvl.number}: ${lvl.name} &nbsp;•&nbsp; ⭐ ${stars}`;
    },

    renderLevelsScreen(userId) {
        // Crear pantalla si no existe
        let screen = document.getElementById('levels-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'levels-screen';
            screen.className = 'screen';
            document.body.appendChild(screen);
        }

        const currentLevel = this.getCurrentLevel(userId);
        const totalStars   = this.getTotalStars(userId);
        const progress     = this.getUserProgress(userId);

        let cardsHtml = '';
        this.levelsData.forEach(lvl => {
            const unlocked  = this.isLevelUnlocked(userId, lvl.number);
            const isCurrent = lvl.number === currentLevel;
            const done      = lvl.number < currentLevel;
            const done_acts = this.getCompletedInLevel(userId, lvl.number);
            const total_acts = lvl.vocales.length * 4;
            const pct = Math.min(100, Math.round((done_acts / total_acts) * 100));

            const borderColor = done ? '#7ED321' : (isCurrent ? '#4A90E2' : '#e0e0e0');
            const bgColor     = done ? '#f0fff4' : (isCurrent ? '#e8f4fd' : 'white');

            const starsNeeded = lvl.requiredStars - totalStars;

            cardsHtml += `
                <div style="background:${bgColor};border:4px solid ${borderColor};border-radius:24px;
                            padding:1.5rem;margin-bottom:1.2rem;
                            opacity:${unlocked ? '1' : '0.55'};position:relative;
                            box-shadow:0 4px 15px rgba(0,0,0,0.07);">

                    <!-- Icono de estado -->
                    <div style="position:absolute;top:1rem;right:1rem;font-size:1.8rem;">
                        ${done ? '✅' : isCurrent ? '👉' : unlocked ? '🔓' : '🔒'}
                    </div>

                    <!-- Fila: icono + título -->
                    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
                        <div style="font-size:3.5rem;">${lvl.icon}</div>
                        <div>
                            <div style="font-size:1.5rem;font-weight:900;color:#333;">
                                Nivel ${lvl.number}: ${lvl.name}
                            </div>
                            <div style="font-size:0.95rem;color:#666;">${lvl.description}</div>
                        </div>
                    </div>

                    <!-- Vocales del nivel -->
                    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">
                        ${lvl.vocales.map(v => {
                            const vp = progress[v] || { completed: 0, stars: 0 };
                            const vColor = { a:'#FF6B6B', e:'#4ECDC4', i:'#F9CA24', o:'#FF9F43', u:'#A29BFE' }[v];
                            return `<div style="background:${vColor};color:white;font-weight:900;
                                               font-family:'Fredoka One',cursive;font-size:1.3rem;
                                               width:42px;height:42px;border-radius:12px;
                                               display:flex;align-items:center;justify-content:center;">
                                        ${v.toUpperCase()}
                                    </div>
                                    <div style="display:flex;align-items:center;font-size:0.85rem;
                                               color:#666;font-weight:700;margin-right:0.5rem;">
                                        ${'⭐'.repeat(vp.stars)}${'☆'.repeat(Math.max(0,4-vp.stars))}
                                    </div>`;
                        }).join('')}
                    </div>

                    <!-- Barra de progreso del nivel -->
                    <div style="background:#eee;border-radius:20px;height:14px;overflow:hidden;margin-bottom:0.8rem;">
                        <div style="height:100%;border-radius:20px;background:${borderColor};
                                    width:${pct}%;transition:width 0.5s;"></div>
                    </div>
                    <div style="font-size:0.9rem;color:#666;font-weight:700;text-align:center;margin-bottom:0.8rem;">
                        ${done_acts}/${total_acts} actividades · ${pct}%
                    </div>

                    <!-- Recompensa -->
                    <div style="background:#fff9e6;border-radius:12px;padding:0.7rem 1rem;font-size:0.95rem;font-weight:700;color:#F5A623;">
                        Recompensa: ${lvl.reward}
                    </div>

                    ${!unlocked ? `
                        <div style="margin-top:0.8rem;text-align:center;font-size:0.9rem;font-weight:700;color:#999;">
                            🔒 Necesitas ${starsNeeded} ⭐ más para desbloquear
                        </div>` : ''}

                    ${isCurrent && this.canAdvanceToNextLevel(userId) ? `
                        <button class="btn-big btn-blue" onclick="levels.advanceToNextLevel()" style="margin-top:1rem;width:100%;">
                            <span>🚀</span><span>¡Subir al siguiente nivel!</span>
                        </button>` : ''}
                </div>
            `;
        });

        screen.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100vh;background:#f0f4ff;">
                <!-- Header -->
                <div style="background:white;padding:1rem 1.5rem;display:flex;align-items:center;gap:1rem;
                            box-shadow:0 2px 10px rgba(0,0,0,0.08);flex-shrink:0;">
                    <button class="btn-back" onclick="app.goToScreen('menu-screen')">← Atrás</button>
                    <span style="font-size:1.5rem;font-weight:900;color:#333;flex:1;">📊 Mis Niveles</span>
                    <div style="background:linear-gradient(135deg,#FFE66D,#F5A623);
                                color:#333;padding:0.5rem 1rem;border-radius:50px;font-weight:900;">
                        ⭐ ${totalStars}
                    </div>
                </div>

                <!-- Resumen -->
                <div style="background:white;margin:0;padding:1rem 1.5rem;border-bottom:2px solid #eee;flex-shrink:0;">
                    <div style="display:flex;justify-content:space-around;text-align:center;">
                        <div>
                            <div style="font-size:2rem;font-weight:900;color:#4A90E2;">${currentLevel}</div>
                            <div style="font-size:0.85rem;color:#666;font-weight:700;">Nivel actual</div>
                        </div>
                        <div>
                            <div style="font-size:2rem;font-weight:900;color:#F5A623;">${totalStars}</div>
                            <div style="font-size:0.85rem;color:#666;font-weight:700;">Estrellas</div>
                        </div>
                        <div>
                            <div style="font-size:2rem;font-weight:900;color:#7ED321;">
                                ${Object.values(this.getUserProgress(userId)).filter(p => p.completed >= 4).length}/5
                            </div>
                            <div style="font-size:0.85rem;color:#666;font-weight:700;">Vocales</div>
                        </div>
                    </div>
                </div>

                <!-- Lista de niveles -->
                <div style="flex:1;overflow-y:auto;padding:1.5rem;">
                    ${cardsHtml}
                </div>
            </div>
        `;

        app.goToScreen('levels-screen');
    },

    advanceToNextLevel() {
        if (!app.currentUser) return;
        if (this.advanceLevel(app.currentUser.id)) {
            const next = this.getCurrentLevel(app.currentUser.id);
            const info = this.getLevelInfo(next);
            try { audioManager.playCelebrationMelody(); } catch(e) {}
            app.showCelebration(`¡Subiste al Nivel ${next}: ${info.name}! ${info.icon}`);
            setTimeout(() => {
                app.closeModal();
                this.renderLevelsScreen(app.currentUser.id);
            }, 2800);
        }
    }
};

window.levels = levels;
