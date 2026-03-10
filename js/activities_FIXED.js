/* ============================================
   ACTIVITIES.JS - PROGRESO REAL
   ============================================ */

const activities = {
    currentVocal: null,
    currentActivityIndex: 0,
    foundCount: 0,
    pairsFound: 0,
    canFlip: true,
    firstCard: null,
    secondCard: null,
    canvasCtx: null,
    canvasLetterData: null,

    vocalsData: {
        a: {
            letter: 'A', color: '#FF6B6B', emoji: '🍎', word: 'Manzana',
            examples: [
                { emoji: '🍎', word: 'Manzana', correct: true },
                { emoji: '✈️', word: 'Avión', correct: true },
                { emoji: '🌳', word: 'Árbol', correct: true },
                { emoji: '🐝', word: 'Abeja', correct: true },
                { emoji: '🐶', word: 'Perro', correct: false },
                { emoji: '🚗', word: 'Carro', correct: false }
            ]
        },
        e: {
            letter: 'E', color: '#4ECDC4', emoji: '🐘', word: 'Elefante',
            examples: [
                { emoji: '🐘', word: 'Elefante', correct: true },
                { emoji: '⭐', word: 'Estrella', correct: true },
                { emoji: '🌿', word: 'Enredadera', correct: true },
                { emoji: '🪞', word: 'Espejo', correct: true },
                { emoji: '🍌', word: 'Banano', correct: false },
                { emoji: '⚽', word: 'Pelota', correct: false }
            ]
        },
        i: {
            letter: 'I', color: '#F9CA24', emoji: '⛪', word: 'Iglesia',
            examples: [
                { emoji: '⛪', word: 'Iglesia', correct: true },
                { emoji: '🏝️', word: 'Isla', correct: true },
                { emoji: '🦎', word: 'Iguana', correct: true },
                { emoji: '🧲', word: 'Imán', correct: true },
                { emoji: '🐱', word: 'Gato', correct: false },
                { emoji: '🍕', word: 'Pizza', correct: false }
            ]
        },
        o: {
            letter: 'O', color: '#FF9F43', emoji: '🐻', word: 'Oso',
            examples: [
                { emoji: '🐑', word: 'Oveja', correct: true },
                { emoji: '🐻', word: 'Oso', correct: true },
                { emoji: '👁️', word: 'Ojo', correct: true },
                { emoji: '👂', word: 'Oreja', correct: true },
                { emoji: '🍓', word: 'Fresa', correct: false },
                { emoji: '🚲', word: 'Bici', correct: false }
            ]
        },
        u: {
            letter: 'U', color: '#A29BFE', emoji: '🍇', word: 'Uvas',
            examples: [
                { emoji: '🍇', word: 'Uvas', correct: true },
                { emoji: '🦄', word: 'Unicornio', correct: true },
                { emoji: '🐛', word: 'Oruga', correct: true },
                { emoji: '🎓', word: 'Universidad', correct: true },
                { emoji: '🐟', word: 'Pez', correct: false },
                { emoji: '🏠', word: 'Casa', correct: false }
            ]
        }
    },

    start(vocal) {
        this.currentVocal = vocal.toLowerCase();
        this.currentActivityIndex = 0;
        console.log('🎯 Vocal:', vocal.toUpperCase());
        app.goToScreen('activity-screen');
        setTimeout(() => this.loadActivity(0), 200);
    },

    loadActivity(index) {
        this.currentActivityIndex = index;
        switch(index) {
            case 0: this.renderActivity1(); break;
            case 1: this.renderActivity2(); break;
            case 2: this.renderActivity3(); break;
            case 3: this.renderActivity4(); break;
            default: this.completeVocal();
        }
    },

    renderActivity1() {
        const d = this.vocalsData[this.currentVocal];
        const screen = document.getElementById('activity-screen');
        screen.innerHTML = `
            <div class="act-header">
                <button class="btn-back" onclick="app.goToScreen('menu-screen')">← Atrás</button>
                <div class="act-title">Ver y Escuchar</div>
                <div class="act-progress">1 / 4</div>
            </div>
            <div class="act-body" style="background:${d.color}18; padding:2rem; text-align:center;">
                <div style="font-size:5rem; margin-bottom:1rem;">🦜</div>
                <div style="font-size:140px; font-family:'Fredoka One',cursive; color:${d.color}; margin-bottom:1rem;">
                    ${d.letter}
                </div>
                <div style="font-size:70px; margin-bottom:1rem;">${d.emoji}</div>
                <div style="font-size:2.2rem; font-weight:900; margin-bottom:2rem;">${d.word}</div>
                <button class="btn-big btn-blue" onclick="audioManager.speakVocal('${this.currentVocal}')" style="margin-bottom:1.5rem;">
                    <span>🔊</span><span>ESCUCHAR</span>
                </button>
                <button class="btn-big btn-green" onclick="activities.completeActivity()" style="margin-top:1rem;">
                    <span>✅</span><span>SIGUIENTE</span>
                </button>
            </div>`;
        setTimeout(() => { try { audioManager.speakVocal(this.currentVocal); } catch(e) {} }, 700);
    },

    renderActivity2() {
        const d = this.vocalsData[this.currentVocal];
        const screen = document.getElementById('activity-screen');
        screen.innerHTML = `
            <div class="act-header">
                <button class="btn-back" onclick="app.goToScreen('menu-screen')">← Atrás</button>
                <div class="act-title">Trazar la Letra</div>
                <div class="act-progress">2 / 4</div>
            </div>
            <div class="act-body" style="padding:1.5rem; text-align:center;">
                <p style="font-size:1.5rem; font-weight:700; margin-bottom:1rem;">
                    Traza la letra <span style="color:${d.color}; font-size:2rem;">${d.letter}</span>
                </p>
                <canvas id="trace-canvas" width="340" height="340" style="
                    border:5px solid ${d.color}; border-radius:20px; background:white;
                    cursor:crosshair; touch-action:none; max-width:100%; display:block; margin:0 auto;">
                </canvas>
                <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center; flex-wrap:wrap;">
                    <button class="btn-back" onclick="activities.clearCanvas()">🔄 Borrar</button>
                    <button class="btn-big btn-green" onclick="activities.completeActivity()" style="max-width:250px;">
                        <span>✅</span><span>Siguiente</span>
                    </button>
                </div>
            </div>`;
        setTimeout(() => this.initCanvas(d), 200);
    },

    initCanvas(d) {
        const canvas = document.getElementById('trace-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let drawing = false, lx = 0, ly = 0;

        ctx.fillStyle = d.color + '25';
        ctx.font = 'bold 270px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.letter, 170, 170);

        ctx.strokeStyle = d.color;
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';

        const pos = (e) => {
            const r = canvas.getBoundingClientRect();
            const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
            const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
            return { x: cx*(canvas.width/r.width), y: cy*(canvas.height/r.height) };
        };
        const down = (e) => { e.preventDefault(); drawing=true; const p=pos(e); lx=p.x; ly=p.y; };
        const move = (e) => {
            if(!drawing) return; e.preventDefault();
            const p=pos(e);
            ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(p.x,p.y); ctx.stroke();
            lx=p.x; ly=p.y;
        };
        const up = () => { drawing=false; };

        canvas.addEventListener('mousedown', down);
        canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', up);
        canvas.addEventListener('mouseleave', up);
        canvas.addEventListener('touchstart', down, {passive:false});
        canvas.addEventListener('touchmove', move, {passive:false});
        canvas.addEventListener('touchend', up);

        this.canvasCtx = ctx;
        this.canvasLetterData = d;
    },

    clearCanvas() {
        const canvas = document.getElementById('trace-canvas');
        if (!canvas || !this.canvasCtx) return;
        const ctx = this.canvasCtx;
        const d = this.canvasLetterData;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = d.color + '25';
        ctx.font = 'bold 270px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.letter, 170, 170);
    },

    renderActivity3() {
        const d = this.vocalsData[this.currentVocal];
        const shuffled = [...d.examples].sort(() => Math.random() - 0.5);
        this.foundCount = 0;

        const screen = document.getElementById('activity-screen');
        screen.innerHTML = `
            <div class="act-header">
                <button class="btn-back" onclick="app.goToScreen('menu-screen')">← Atrás</button>
                <div class="act-title">Encontrar Objetos</div>
                <div class="act-progress">3 / 4</div>
            </div>
            <div class="act-body" style="padding:1.5rem;">
                <p style="font-size:1.4rem; font-weight:900; text-align:center; margin-bottom:0.5rem;">
                    Toca lo que empieza con
                </p>
                <div style="font-size:5rem; color:${d.color}; text-align:center; font-family:'Fredoka One',cursive; margin-bottom:1.5rem;">
                    ${d.letter}
                </div>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.8rem; max-width:500px; margin:0 auto;">
                    ${shuffled.map((item, i) => `
                        <div onclick="activities.checkObject(this)" data-correct="${item.correct}"
                             style="display:flex; flex-direction:column; align-items:center; justify-content:center;
                                    background:white; border:4px solid ${d.color}40; border-radius:16px;
                                    padding:1rem 0.5rem; cursor:pointer; transition:all 0.25s; aspect-ratio:1;">
                            <div style="font-size:45px;">${item.emoji}</div>
                            <div style="font-size:0.9rem; font-weight:700; margin-top:0.4rem; text-align:center;">${item.word}</div>
                        </div>`).join('')}
                </div>
                <p id="found-count" style="text-align:center; font-size:1.4rem; font-weight:700; color:${d.color}; margin-top:1.2rem;">
                    Encontrados: 0 / 4
                </p>
            </div>`;
    },

    checkObject(el) {
        if (el.classList.contains('found')) return;
        const correct = el.dataset.correct === 'true';

        if (correct) {
            el.classList.add('found');
            el.style.background = '#E8F5E9';
            el.style.border = '4px solid #7ED321';
            try { audioManager.playSuccess(); } catch(e) {}
            this.foundCount++;
            const fc = document.getElementById('found-count');
            if (fc) fc.textContent = 'Encontrados: ' + this.foundCount + ' / 4';
            if (this.foundCount >= 4) {
                setTimeout(() => {
                    app.showCelebration('¡Encontraste todos! ⭐');
                    setTimeout(() => { app.closeModal(); this.completeActivity(); }, 2000);
                }, 500);
            }
        } else {
            el.style.background = '#FFEBEE';
            el.style.border = '4px solid #FF6B6B';
            try { audioManager.playError(); } catch(e) {}
            setTimeout(() => {
                el.style.background = 'white';
                el.style.border = '4px solid rgba(0,0,0,0.1)';
            }, 700);
        }
    },

    renderActivity4() {
        const d = this.vocalsData[this.currentVocal];
        const pairs = d.examples.filter(e => e.correct).slice(0, 3);
        const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
        this.pairsFound = 0;
        this.firstCard = null;
        this.secondCard = null;
        this.canFlip = true;

        const screen = document.getElementById('activity-screen');
        screen.innerHTML = `
            <div class="act-header">
                <button class="btn-back" onclick="app.goToScreen('menu-screen')">← Atrás</button>
                <div class="act-title">Juego de Memoria</div>
                <div class="act-progress">4 / 4</div>
            </div>
            <div class="act-body" style="padding:1.5rem; text-align:center;">
                <p style="font-size:1.4rem; font-weight:700; margin-bottom:1.5rem;">
                    Encuentra los pares de <span style="color:${d.color};">${d.letter}</span>
                </p>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; max-width:380px; margin:0 auto;">
                    ${cards.map((c, i) => `
                        <div class="mem-card" data-emoji="${c.emoji}" onclick="activities.flipCard(this)"
                             style="aspect-ratio:1; background:${d.color}; border-radius:16px;
                                    display:flex; align-items:center; justify-content:center;
                                    font-size:2.2rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                            ❓
                        </div>`).join('')}
                </div>
                <p id="pairs-count" style="font-size:1.4rem; font-weight:700; color:${d.color}; margin-top:1.2rem;">
                    Pares: 0 / 3
                </p>
            </div>`;
    },

    flipCard(el) {
        if (!this.canFlip) return;
        if (el.classList.contains('matched')) return;
        if (el === this.firstCard) return;

        const d = this.vocalsData[this.currentVocal];
        el.textContent = el.dataset.emoji;
        el.style.background = 'white';
        el.style.border = '3px solid ' + d.color;
        try { audioManager.playClick(); } catch(e) {}

        if (!this.firstCard) {
            this.firstCard = el;
        } else {
            this.secondCard = el;
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 900);
        }
    },

    checkMatch() {
        const d = this.vocalsData[this.currentVocal];
        const e1 = this.firstCard.dataset.emoji;
        const e2 = this.secondCard.dataset.emoji;

        if (e1 === e2) {
            [this.firstCard, this.secondCard].forEach(c => {
                c.classList.add('matched');
                c.style.background = '#7ED321';
                c.style.border = 'none';
            });
            try { audioManager.playSuccess(); } catch(e) {}
            this.pairsFound++;
            const pc = document.getElementById('pairs-count');
            if (pc) pc.textContent = 'Pares: ' + this.pairsFound + ' / 3';
            if (this.pairsFound >= 3) {
                setTimeout(() => this.completeActivity(), 800);
            }
        } else {
            // No es par: guardamos referencia local antes de limpiar
            const c1 = this.firstCard;
            const c2 = this.secondCard;
            this.firstCard = null;
            this.secondCard = null;
            try { audioManager.playError(); } catch(e) {}
            setTimeout(() => {
                if (c1) { c1.textContent = '❓'; c1.style.background = d.color; c1.style.border = 'none'; }
                if (c2) { c2.textContent = '❓'; c2.style.background = d.color; c2.style.border = 'none'; }
                this.canFlip = true;
            }, 900);
            return;
        }
        this.firstCard = null;
        this.secondCard = null;
        setTimeout(() => { this.canFlip = true; }, 1000);
    },

    // ✅ GUARDAR PROGRESO REAL
    completeActivity() {
        if (!app.currentUser) return;

        const actNum = this.currentActivityIndex + 1;
        
        // Guardar en progreso
        this.saveProgress(actNum);

        // Si completó la actividad 4, completar toda la vocal
        if (actNum >= 4) {
            this.completeVocal();
        } else {
            // Pasar a siguiente actividad
            this.loadActivity(actNum);
        }
    },

    saveProgress(completedActivity) {
        if (!app.currentUser) return;
        const vocal = this.currentVocal;
        const starsCount = Math.min(completedActivity, 4);
        // Usar el método centralizado de app.js que persiste en localStorage
        app.saveUserProgress(vocal, completedActivity, starsCount);
    },

    completeVocal() {
        // Guardar progreso completo PRIMERO
        this.saveProgress(4);

        try { audioManager.playCelebrationMelody(); } catch(e) {}
        app.showCelebration('¡Completaste la ' + this.currentVocal.toUpperCase() + '! 🌟');

        setTimeout(() => {
            app.closeModal();
            app.goToScreen('menu-screen');
            app.refreshProgress();
            // Verificar diploma DESPUES con datos frescos del storage
            setTimeout(() => this.checkForDiploma(), 600);
        }, 3000);
    },

    checkForDiploma() {
        if (!app.currentUser) return;

        // Usar el metodo centralizado del certificate que recalcula desde storage
        if (typeof certificate !== 'undefined' && certificate.canGetDiploma(app.currentUser.id)) {
            app.showCelebration('¡🎉 FELICIDADES! ¡Ganaste tu DIPLOMA! 🎓');
            setTimeout(() => {
                app.closeModal();
                certificate.renderDiplomaScreen(app.currentUser.id);
            }, 3000);
        }
    }
};

window.activities = activities;
