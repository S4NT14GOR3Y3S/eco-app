/* ============================================
   CERTIFICATE.JS v3 - DIPLOMA A PRUEBA DE FALLOS
   ============================================ */

const certificate = {

    // Calcular estrellas reales desde el progreso (nunca confiar en totalStars)
    _calcStars(userId) {
        try {
            const user = storage.getUser(userId);
            if (!user) return { totalStars: 0, allComplete: false, completed: 0 };
            const prog = user.progress || {};
            let totalStars = 0, completedVocals = 0;
            let allComplete = true;
            ['a','e','i','o','u'].forEach(v => {
                const p = prog[v] || { completed: 0, stars: 0 };
                const s = Math.min(p.stars || 0, 4);
                const c = p.completed || 0;
                totalStars += s;
                if (c >= 4) completedVocals++;
                else allComplete = false;
            });
            return { totalStars, allComplete, completed: completedVocals, user };
        } catch(e) {
            console.error('_calcStars error:', e);
            return { totalStars: 0, allComplete: false, completed: 0 };
        }
    },

    canGetDiploma(userId) {
        const { totalStars, allComplete } = this._calcStars(userId);
        console.log('🎓 canGetDiploma:', totalStars, '/20, completas:', allComplete);
        return totalStars >= 20 && allComplete;
    },

    // Punto de entrada del botón 🎓 del menú
    checkAndShow(userId) {
        const { totalStars, allComplete, completed } = this._calcStars(userId);
        console.log('🎓 checkAndShow:', totalStars, '/20 ⭐ | vocales:', completed, '/5 | allComplete:', allComplete);

        if (totalStars >= 20 && allComplete) {
            this.renderDiplomaScreen(userId);
        } else {
            const remaining = 20 - totalStars;
            app.showMessage('⭐ ' + totalStars + '/20 estrellas  |  Vocales: ' + completed + '/5  —  ¡Sigue así! 💪');
        }
    },

    renderDiplomaScreen(userId) {
        const { user, totalStars } = this._calcStars(userId);
        if (!user) { app.showMessage('❌ Error cargando usuario'); return; }

        // Marcar diploma como obtenido
        if (!user.hasDiploma) {
            user.hasDiploma = true;
            user.diplomaDate = new Date().toISOString();
            try { storage.saveUser(user); } catch(e) {}
            if (app.currentUser) {
                app.currentUser.hasDiploma = true;
                app.currentUser.diplomaDate = user.diplomaDate;
            }
        }

        // Crear pantalla si no existe
        let screen = document.getElementById('diploma-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'diploma-screen';
            screen.className = 'screen';
            document.body.appendChild(screen);
        }

        const dateStr = new Date(user.diplomaDate).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        screen.innerHTML = `
            <div style="min-height:100vh;background:linear-gradient(135deg,#667eea,#764ba2);
                        padding:1.5rem;overflow-y:auto;">

                <!-- Botón volver -->
                <div style="margin-bottom:1rem;">
                    <button class="btn-back" style="background:rgba(255,255,255,0.2);color:white;border-color:rgba(255,255,255,0.4);"
                            onclick="app.goToScreen('menu-screen')">← Menú</button>
                </div>

                <!-- Confeti -->
                <div style="text-align:center;font-size:2.5rem;letter-spacing:0.3rem;margin-bottom:1rem;">
                    🎉🌟🎊⭐🎉🌟🎊
                </div>

                <!-- Diploma -->
                <div id="diploma-certificate" style="background:white;border:8px solid #FFD700;
                            border-radius:24px;padding:2.5rem 2rem;max-width:600px;
                            margin:0 auto;box-shadow:0 20px 60px rgba(0,0,0,0.4);position:relative;">

                    <!-- Esquinas decorativas -->
                    <div style="position:absolute;top:12px;left:12px;font-size:2.5rem;">🌟</div>
                    <div style="position:absolute;top:12px;right:12px;font-size:2.5rem;">🌟</div>
                    <div style="position:absolute;bottom:12px;left:12px;font-size:2.5rem;">⭐</div>
                    <div style="position:absolute;bottom:12px;right:12px;font-size:2.5rem;">⭐</div>

                    <!-- Encabezado -->
                    <div style="text-align:center;margin-bottom:1.5rem;">
                        <div style="font-size:5rem;">🎓</div>
                        <h1 style="font-family:'Fredoka One',cursive;font-size:2.8rem;color:#4A90E2;margin:0.5rem 0;">
                            DIPLOMA DE HONOR
                        </h1>
                        <div style="font-size:1rem;color:#888;font-weight:700;letter-spacing:2px;">
                            ECO · APRENDO LAS VOCALES
                        </div>
                    </div>

                    <!-- Cuerpo -->
                    <div style="text-align:center;margin:2rem 0;">
                        <p style="font-size:1.1rem;color:#555;margin-bottom:1rem;">
                            Este diploma se otorga con orgullo a
                        </p>
                        <div style="font-family:'Fredoka One',cursive;font-size:3.5rem;
                                    color:#FF9F43;padding:1rem;
                                    border-top:3px solid #FFD700;border-bottom:3px solid #FFD700;
                                    margin:1rem 0;">
                            ${user.avatar || '🎓'} ${user.name}
                        </div>
                        <p style="font-size:1.05rem;color:#555;line-height:1.8;margin-top:1.5rem;">
                            Por completar exitosamente todas las actividades del<br>
                            <strong style="color:#4A90E2;font-size:1.2rem;">Curso de las 5 Vocales</strong><br>
                            con dedicación, esfuerzo y excelencia.
                        </p>
                    </div>

                    <!-- Estadísticas -->
                    <div style="background:linear-gradient(135deg,#E8F5E9,#C8E6C9);
                                border-radius:16px;padding:1.5rem;margin:1.5rem 0;">
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;text-align:center;">
                            <div>
                                <div style="font-family:'Fredoka One',cursive;font-size:2.8rem;color:#7ED321;">
                                    ${totalStars}
                                </div>
                                <div style="font-size:0.85rem;color:#555;font-weight:700;">Estrellas ⭐</div>
                            </div>
                            <div>
                                <div style="font-family:'Fredoka One',cursive;font-size:2.8rem;color:#4A90E2;">5</div>
                                <div style="font-size:0.85rem;color:#555;font-weight:700;">Vocales 🔤</div>
                            </div>
                            <div>
                                <div style="font-family:'Fredoka One',cursive;font-size:2.8rem;color:#FF9F43;">20</div>
                                <div style="font-size:0.85rem;color:#555;font-weight:700;">Actividades 🏆</div>
                            </div>
                        </div>
                        <!-- Vocales con sus colores -->
                        <div style="display:flex;justify-content:center;gap:0.8rem;margin-top:1.2rem;flex-wrap:wrap;">
                            ${[
                                {v:'A',c:'#FF6B6B'},{v:'E',c:'#4ECDC4'},
                                {v:'I',c:'#F9CA24'},{v:'O',c:'#FF9F43'},{v:'U',c:'#A29BFE'}
                            ].map(x => `
                                <div style="background:${x.c};color:white;font-family:'Fredoka One',cursive;
                                            font-size:1.5rem;width:48px;height:48px;border-radius:12px;
                                            display:flex;align-items:center;justify-content:center;
                                            box-shadow:0 3px 8px rgba(0,0,0,0.2);">
                                    ${x.v}
                                </div>`).join('')}
                        </div>
                    </div>

                    <!-- Firma y fecha -->
                    <div style="margin-top:2rem;display:flex;justify-content:space-around;align-items:flex-end;">
                        <div style="text-align:center;">
                            <div style="width:140px;border-top:2px solid #333;margin-bottom:0.4rem;"></div>
                            <div style="font-size:0.85rem;font-weight:700;color:#555;">ECO App</div>
                            <div style="font-size:0.75rem;color:#999;">${dateStr}</div>
                        </div>
                        <div style="width:80px;height:80px;border-radius:50%;
                                    background:linear-gradient(135deg,#4A90E2,#764ba2);
                                    display:flex;align-items:center;justify-content:center;
                                    font-size:2.5rem;border:5px solid #FFD700;
                                    box-shadow:0 5px 15px rgba(0,0,0,0.3);">
                            🦜
                        </div>
                    </div>

                    <!-- Frase motivadora -->
                    <div style="margin-top:1.5rem;padding:1rem;
                                background:linear-gradient(135deg,#FFF9E6,#FFE66D30);
                                border-radius:12px;text-align:center;
                                font-style:italic;color:#666;font-size:0.95rem;line-height:1.6;">
                        "¡Lo lograste! Con esfuerzo y dedicación aprendiste todas las vocales.<br>
                        ¡Sigue creciendo y aprendiendo cada día!" 🌈
                    </div>
                </div>

                <!-- Botones -->
                <div style="max-width:600px;margin:1.5rem auto;display:flex;flex-direction:column;gap:1rem;">
                    <button class="btn-big btn-blue" onclick="certificate.downloadDiploma()" style="width:100%;">
                        <span>📥</span><span>DESCARGAR DIPLOMA</span>
                    </button>
                    <button class="btn-big btn-green" onclick="certificate.shareDiploma()" style="width:100%;">
                        <span>📤</span><span>COMPARTIR</span>
                    </button>
                    <button class="btn-big btn-gray" onclick="app.goToScreen('menu-screen')" style="width:100%;">
                        <span>🏠</span><span>VOLVER AL MENÚ</span>
                    </button>
                </div>

                <!-- Confeti abajo -->
                <div style="text-align:center;font-size:2rem;letter-spacing:0.3rem;margin-top:1rem;padding-bottom:2rem;">
                    🎊🎉🌟⭐🎊🎉🌟
                </div>
            </div>
        `;

        // Activar pantalla
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');

        try { audioManager.playCelebrationMelody(); } catch(e) {}
    },

    downloadDiploma() {
        try { audioManager.playClick(); } catch(e) {}
        if (typeof html2canvas !== 'undefined') {
            const el = document.getElementById('diploma-certificate');
            html2canvas(el, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'diploma_eco_' + (app.currentUser?.name || 'diploma') + '.png';
                link.href = canvas.toDataURL();
                link.click();
                app.showMessage('✅ ¡Diploma descargado!');
            }).catch(() => app.showMessage('📸 Captura la pantalla para guardar tu diploma'));
        } else {
            app.showMessage('📸 Captura la pantalla para guardar tu diploma');
        }
    },

    shareDiploma() {
        try { audioManager.playClick(); } catch(e) {}
        if (navigator.share) {
            navigator.share({
                title: '¡Obtuve mi diploma en ECO!',
                text: '¡Completé todas las vocales en ECO! 🎓',
                url: window.location.href
            }).catch(() => {});
        } else {
            app.showMessage('📸 Captura la pantalla para compartir tu diploma');
        }
    }
};

// Cargar html2canvas para descarga
(function() {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.async = true;
    document.head.appendChild(s);
})();

window.certificate = certificate;
window.diploma = certificate;
