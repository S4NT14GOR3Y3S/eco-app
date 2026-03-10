/* ============================================
   GAMES.JS v2 - JUEGOS COMPLETAMENTE FUNCIONALES
   - Conectar: toca objetos para seleccionar/deseleccionar
   - Colorear: toca letras para colorearlas
   ============================================ */

const games = {
    currentGame: null,
    currentVocal: null,
    connectState: null,
    coloringState: null,

    // ══════════════════════════════════════════
    // JUEGO 1: CONECTAR (sin drag, tap-to-connect)
    // ══════════════════════════════════════════
    renderConnectGame(vocal) {
        this.currentVocal = vocal;
        this.currentGame = 'connect';

        const data = activities.vocalsData[vocal];

        // Activar la pantalla de actividad PRIMERO
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('activity-screen');
        if (screen) screen.classList.add('active');

        // 4 objetos correctos + 2 incorrectos, mezclados
        const correctOnes = data.examples.filter(e => e.correct).slice(0, 4);
        const wrongOnes   = data.examples.filter(e => !e.correct).slice(0, 2);
        const allObjects  = [...correctOnes, ...wrongOnes].sort(() => Math.random() - 0.5);

        screen.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100vh;background:#f0f4ff;">
                <div style="background:white;padding:1rem 1.5rem;display:flex;align-items:center;gap:1rem;box-shadow:0 2px 10px rgba(0,0,0,0.08);flex-shrink:0;">
                    <button class="btn-back" onclick="app.goToScreen('games-menu-screen')">← Atrás</button>
                    <span style="font-size:1.4rem;font-weight:900;color:#333;flex:1;">Toca los que empiezan con
                        <span style="color:${data.color};font-size:1.8rem;"> ${data.letter}</span>
                    </span>
                </div>

                <div style="flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;align-items:center;">
                    <p style="font-size:1rem;color:#666;font-weight:700;margin:0;">✅ Toca los objetos correctos. Toca de nuevo para deseleccionar.</p>

                    <div id="connect-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;width:100%;max-width:500px;">
                        ${allObjects.map((obj, i) => `
                            <div id="obj-${i}"
                                 onclick="games.toggleObject(${i}, ${obj.correct})"
                                 data-correct="${obj.correct}"
                                 data-selected="false"
                                 style="background:white;border:4px solid #e0e0e0;border-radius:20px;
                                        padding:1rem 0.5rem;text-align:center;cursor:pointer;
                                        transition:all 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                                <div style="font-size:3.5rem;">${obj.emoji}</div>
                                <div style="font-size:1rem;font-weight:900;color:#333;margin-top:0.4rem;">${obj.word}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div id="connect-feedback" style="font-size:1.4rem;font-weight:900;min-height:2.5rem;text-align:center;padding:0.5rem;"></div>

                    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-big btn-gray" onclick="games.resetConnect()" style="max-width:200px;">
                            <span>🔄</span><span>Limpiar</span>
                        </button>
                        <button class="btn-big btn-green" onclick="games.checkConnect()" style="max-width:200px;">
                            <span>✅</span><span>Verificar</span>
                        </button>
                    </div>

                    <!-- Referencia visual: la letra en grande -->
                    <div style="margin-top:1rem;background:white;border-radius:20px;padding:1.5rem 2.5rem;
                                box-shadow:0 4px 12px rgba(0,0,0,0.08);text-align:center;">
                        <div style="font-family:'Fredoka One',cursive;font-size:6rem;color:${data.color};line-height:1;">
                            ${data.letter}
                        </div>
                        <div style="font-size:1rem;font-weight:700;color:#666;">Empieza con ${data.letter}</div>
                    </div>
                </div>
            </div>
        `;

        this.connectState = {
            data: data,
            objects: allObjects,
            selected: new Array(allObjects.length).fill(false)
        };

        try { audioManager.speakPhrase('Toca los objetos que empiezan con ' + data.letter, 'calm'); } catch(e) {}
    },

    toggleObject(index, isCorrect) {
        const el = document.getElementById('obj-' + index);
        if (!el) return;
        const data = this.connectState.data;
        const isSelected = this.connectState.selected[index];

        this.connectState.selected[index] = !isSelected;

        if (!isSelected) {
            // Seleccionar
            el.style.borderColor = data.color;
            el.style.background = data.color + '20';
            el.style.transform = 'scale(1.05)';
            el.querySelector('div:first-child').style.filter = '';
        } else {
            // Deseleccionar
            el.style.borderColor = '#e0e0e0';
            el.style.background = 'white';
            el.style.transform = 'scale(1)';
        }

        // Limpiar feedback al cambiar selección
        document.getElementById('connect-feedback').textContent = '';
        try { audioManager.playClick(); } catch(e) {}
    },

    resetConnect() {
        const data = this.connectState.data;
        this.connectState.selected.fill(false);
        this.connectState.selected.forEach((_, i) => {
            const el = document.getElementById('obj-' + i);
            if (el) {
                el.style.borderColor = '#e0e0e0';
                el.style.background = 'white';
                el.style.transform = 'scale(1)';
            }
        });
        document.getElementById('connect-feedback').textContent = '';
        try { audioManager.playClick(); } catch(e) {}
    },

    checkConnect() {
        const objects = this.connectState.objects;
        const selected = this.connectState.selected;
        const data = this.connectState.data;
        const fb = document.getElementById('connect-feedback');

        let correctHits = 0, wrongHits = 0, missed = 0;

        objects.forEach((obj, i) => {
            const el = document.getElementById('obj-' + i);
            if (selected[i]) {
                if (obj.correct) {
                    correctHits++;
                    if (el) { el.style.borderColor = '#7ED321'; el.style.background = '#7ED32120'; }
                } else {
                    wrongHits++;
                    if (el) { el.style.borderColor = '#FF6B6B'; el.style.background = '#FF6B6B20'; }
                }
            } else if (obj.correct) {
                missed++;
                if (el) { el.style.borderColor = '#FFE66D'; el.style.background = '#FFE66D20'; }
            }
        });

        const totalCorrect = objects.filter(o => o.correct).length;

        if (correctHits === totalCorrect && wrongHits === 0) {
            fb.textContent = '¡PERFECTO! 🌟🌟🌟';
            fb.style.color = '#7ED321';
            try { audioManager.playComplete(); } catch(e) {}
            setTimeout(() => {
                app.showCelebration('¡Encontraste todas las que empiezan con ' + data.letter + '! 🎉');
                setTimeout(() => { app.closeModal(); app.goToScreen('menu-screen'); }, 2500);
            }, 800);
        } else if (wrongHits > 0) {
            fb.textContent = '¡Hay algunas incorrectas! Las marcamos en rojo 🔴';
            fb.style.color = '#FF6B6B';
            try { audioManager.playError(); } catch(e) {}
        } else {
            fb.textContent = '¡Faltan algunas! Las amarillas también empiezan con ' + data.letter + ' 💛';
            fb.style.color = '#F5A623';
            try { audioManager.playError(); } catch(e) {}
        }
    },

    // ══════════════════════════════════════════
    // JUEGO 2: COLOREAR LETRAS
    // ══════════════════════════════════════════
    renderColoringGame(vocal) {
        this.currentVocal = vocal;
        this.currentGame = 'coloring';

        const data = activities.vocalsData[vocal];

        // Activar la pantalla de actividad PRIMERO
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('activity-screen');
        if (screen) screen.classList.add('active');

        // Generar letras: ~30% de la vocal objetivo, el resto vocales aleatorias
        const allVocals = ['a','e','i','o','u'];
        const target = vocal.toLowerCase();
        const letters = [];
        for (let i = 0; i < 20; i++) {
            const isTarget = (i % 3 === 0); // cada 3ra es la correcta
            const letter = isTarget ? target : allVocals.filter(v => v !== target)[i % 4];
            letters.push({ letter: letter.toUpperCase(), isTarget: letter === target, colored: false });
        }
        // Asegurar al menos 5 letras objetivo
        let targetCount = letters.filter(l => l.isTarget).length;
        for (let i = 0; targetCount < 5 && i < letters.length; i++) {
            if (!letters[i].isTarget) { letters[i].isTarget = true; letters[i].letter = target.toUpperCase(); targetCount++; }
        }
        // Mezclar
        letters.sort(() => Math.random() - 0.5);

        this.coloringState = {
            data: data,
            letters: letters,
            selectedColor: data.color,
            targetLetter: target.toUpperCase()
        };

        const totalTarget = letters.filter(l => l.isTarget).length;

        const palette = [
            { color: '#FF6B6B', label: '🔴' },
            { color: '#7ED321', label: '🟢' },
            { color: '#4A90E2', label: '🔵' },
            { color: '#FFE66D', label: '🟡' },
            { color: '#A29BFE', label: '🟣' },
            { color: data.color, label: '⭐', isMain: true },
        ];

        screen.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100vh;background:#f0f4ff;">
                <!-- Header -->
                <div style="background:white;padding:1rem 1.5rem;display:flex;align-items:center;gap:1rem;box-shadow:0 2px 10px rgba(0,0,0,0.08);flex-shrink:0;">
                    <button class="btn-back" onclick="app.goToScreen('games-menu-screen')">← Atrás</button>
                    <span style="font-size:1.3rem;font-weight:900;color:#333;flex:1;">
                        Colorea todas las <span style="color:${data.color};font-size:1.6rem;">${data.letter}</span>
                    </span>
                    <span id="color-score" style="font-size:1rem;font-weight:900;color:${data.color};">0/${totalTarget}</span>
                </div>

                <!-- Paleta de colores -->
                <div style="background:white;padding:0.8rem 1.5rem;display:flex;gap:0.8rem;justify-content:center;flex-wrap:wrap;border-bottom:2px solid #eee;flex-shrink:0;">
                    ${palette.map(p => `
                        <div id="pal-${p.color.replace('#','')}"
                             onclick="games.selectColorBtn('${p.color}', this)"
                             style="width:52px;height:52px;border-radius:50%;background:${p.color};
                                    border:${p.isMain ? '4px solid gold' : '3px solid #333'};
                                    display:flex;align-items:center;justify-content:center;
                                    font-size:1.4rem;cursor:pointer;transition:all 0.2s;
                                    box-shadow:0 3px 8px rgba(0,0,0,0.2);">
                            ${p.isMain ? '⭐' : ''}
                        </div>
                    `).join('')}
                </div>

                <!-- Grid de letras -->
                <div style="flex:1;overflow-y:auto;padding:1.2rem;">
                    <div id="letters-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.8rem;max-width:500px;margin:0 auto;">
                        ${letters.map((l, i) => `
                            <div id="ltr-${i}"
                                 onclick="games.colorLetter(${i})"
                                 style="background:${l.colored ? this.coloringState.selectedColor : '#e0e0e0'};
                                        border-radius:16px;padding:1rem 0.5rem;text-align:center;
                                        cursor:pointer;transition:all 0.2s;
                                        box-shadow:0 3px 8px rgba(0,0,0,0.1);">
                                <span style="font-family:'Fredoka One',cursive;font-size:2.5rem;
                                             color:${l.colored ? 'white' : '#888'};">
                                    ${l.letter}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Footer -->
                <div style="background:white;padding:1rem 1.5rem;display:flex;gap:1rem;justify-content:center;box-shadow:0 -2px 10px rgba(0,0,0,0.08);flex-shrink:0;">
                    <button class="btn-big btn-gray" onclick="games.resetColoring()" style="max-width:180px;">
                        <span>🔄</span><span>Borrar</span>
                    </button>
                    <button class="btn-big btn-green" onclick="games.checkColoring()" style="max-width:180px;">
                        <span>✅</span><span>Verificar</span>
                    </button>
                </div>
            </div>
        `;

        // Marcar color principal como seleccionado
        setTimeout(() => {
            const mainBtn = document.getElementById('pal-' + data.color.replace('#',''));
            if (mainBtn) { mainBtn.style.transform = 'scale(1.2)'; mainBtn.style.borderWidth = '5px'; }
        }, 100);

        try { audioManager.speakPhrase('Colorea todas las letras ' + data.letter, 'calm'); } catch(e) {}
    },

    selectColorBtn(color, el) {
        this.coloringState.selectedColor = color;
        // Resetear todos los botones de paleta
        document.querySelectorAll('[id^="pal-"]').forEach(b => {
            b.style.transform = 'scale(1)';
            b.style.borderWidth = '3px';
        });
        el.style.transform = 'scale(1.2)';
        el.style.borderWidth = '5px';
        try { audioManager.playClick(); } catch(e) {}
    },

    colorLetter(index) {
        const l = this.coloringState.letters[index];
        const el = document.getElementById('ltr-' + index);
        if (!el) return;

        l.colored = true;
        l.appliedColor = this.coloringState.selectedColor;

        el.style.background = this.coloringState.selectedColor;
        el.querySelector('span').style.color = 'white';
        el.style.transform = 'scale(1.1)';
        setTimeout(() => { if (el) el.style.transform = 'scale(1)'; }, 200);

        // Actualizar contador
        const data = this.coloringState.data;
        const correctlyColored = this.coloringState.letters.filter(
            l2 => l2.isTarget && l2.colored && l2.appliedColor === data.color
        ).length;
        const total = this.coloringState.letters.filter(l2 => l2.isTarget).length;
        const sc = document.getElementById('color-score');
        if (sc) sc.textContent = correctlyColored + '/' + total;

        try { audioManager.playClick(); } catch(e) {}
    },

    resetColoring() {
        const data = this.coloringState.data;
        this.coloringState.letters.forEach((l, i) => {
            l.colored = false;
            l.appliedColor = null;
            const el = document.getElementById('ltr-' + i);
            if (el) {
                el.style.background = '#e0e0e0';
                el.querySelector('span').style.color = '#888';
            }
        });
        const sc = document.getElementById('color-score');
        if (sc) sc.textContent = '0/' + this.coloringState.letters.filter(l => l.isTarget).length;
        try { audioManager.playClick(); } catch(e) {}
    },

    checkColoring() {
        const data = this.coloringState.data;
        const letters = this.coloringState.letters;

        const totalTarget = letters.filter(l => l.isTarget).length;
        const correctColored = letters.filter(l => l.isTarget && l.colored && l.appliedColor === data.color).length;
        const wrongColored   = letters.filter(l => !l.isTarget && l.colored).length;

        if (correctColored === totalTarget && wrongColored === 0) {
            try { audioManager.playComplete(); } catch(e) {}
            app.showCelebration('¡Coloreaste todas las ' + data.letter + '! 🎨🌟');
            setTimeout(() => { app.closeModal(); app.goToScreen('menu-screen'); }, 2500);
        } else if (wrongColored > 0) {
            app.showMessage('¡Ojo! Solo colorea las que son ' + data.letter + ' 👀');
            // Marcar las incorrectamente coloreadas
            letters.forEach((l, i) => {
                if (!l.isTarget && l.colored) {
                    const el = document.getElementById('ltr-' + i);
                    if (el) { el.style.background = '#FF6B6B'; el.style.border = '3px solid red'; }
                }
            });
            try { audioManager.playError(); } catch(e) {}
        } else {
            app.showMessage('¡Faltan letras ' + data.letter + ' por colorear! (' + correctColored + '/' + totalTarget + ')');
            // Destacar las que faltan
            letters.forEach((l, i) => {
                if (l.isTarget && !l.colored) {
                    const el = document.getElementById('ltr-' + i);
                    if (el) {
                        el.style.border = '3px solid gold';
                        el.style.animation = 'pulse 0.5s 3';
                    }
                }
            });
            try { audioManager.playError(); } catch(e) {}
        }
    }
};

window.games = games;
