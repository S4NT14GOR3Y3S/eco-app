/* ============================================
   APP.JS - Lógica Principal de ECO
   ============================================ */

// Objeto principal de la aplicación
const app = {
    currentScreen: 'loading-screen',
    currentVocal: null,
    currentActivity: 0,
    currentUser: null,
    faceDetector: null,
    videoStream: null,

    // Inicializar la aplicación
    init() {
        console.log('🦜 Iniciando ECO...');
        
        // Simular carga inicial
        setTimeout(() => {
            this.checkFirstTime();
        }, 2000);

        // Event listeners
        this.setupEventListeners();
    },

    // Configurar event listeners
    setupEventListeners() {
        // Prevenir zoom con pellizco en móviles
        document.addEventListener('touchmove', (e) => {
            if (e.scale !== 1) e.preventDefault();
        }, { passive: false });

        // Vibración al tocar botones (si está disponible)
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            });
        });
    },

    // Verificar si es primera vez
    checkFirstTime() {
        const hasUsers = storage.getUsers().length > 0;
        
        if (hasUsers) {
            this.goToScreen('login-screen');
        } else {
            this.goToScreen('welcome-screen');
        }
    },

    // Cambiar de pantalla
    goToScreen(screenId) {
        console.log(`📱 Navegando a: ${screenId}`);
        
        // Ocultar pantalla actual
        const currentScreenEl = document.querySelector('.screen.active');
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }

        // Mostrar nueva pantalla
        let newScreen = document.getElementById(screenId);
        
        // Si la pantalla no existe, crearla dinámicamente
        if (!newScreen) {
            newScreen = this.createScreen(screenId);
        }

        if (newScreen) {
            newScreen.classList.add('active');
            this.currentScreen = screenId;

            // Acciones específicas por pantalla
            if (screenId === 'login-screen') {
                this.initLoginScreen();
            } else if (screenId === 'menu-screen') {
                this.updateProgressBar();
            }
        }
    },

    // Crear pantallas dinámicas
    createScreen(screenId) {
        const body = document.body;
        const div = document.createElement('div');
        div.id = screenId;
        div.className = 'screen';

        if (screenId === 'login-screen') {
            div.innerHTML = this.getLoginHTML();
        }

        body.appendChild(div);
        return div;
    },

    // HTML del login con reconocimiento facial
    getLoginHTML() {
        return `
            <div class="login-container">
                <div class="logo-grande">ECO</div>
                <div class="mascota-saludo">🦜</div>
                <h1 class="title-grande">¡Hola!</h1>
                <p class="subtitle">Mira a la cámara para entrar</p>
                
                <div class="camera-container">
                    <video id="camera-video" class="camera-preview" autoplay playsinline></video>
                    <div class="camera-overlay"></div>
                    <canvas id="camera-canvas" style="display:none;"></canvas>
                </div>
                
                <p class="camera-instruction">Coloca tu cara en el círculo</p>
                
                <div class="profile-options" id="profile-list">
                    <!-- Perfiles existentes se cargan aquí -->
                </div>
                
                <button class="btn-gigante btn-primary" onclick="app.registerNewUser()" style="margin-top: 2rem;">
                    <span class="btn-icon">➕</span>
                    <span class="btn-text">NUEVO NIÑO</span>
                </button>
            </div>
        `;
    },

    // Inicializar pantalla de login
    async initLoginScreen() {
        console.log('📸 Inicializando cámara...');
        
        // Cargar perfiles existentes
        this.loadProfiles();

        // Iniciar cámara
        try {
            await this.startCamera();
            // Empezar detección facial continua
            this.startFaceDetection();
        } catch (error) {
            console.error('❌ Error al iniciar cámara:', error);
            this.showCameraError();
        }
    },

    // Iniciar cámara
    async startCamera() {
        try {
            const video = document.getElementById('camera-video');
            
            const constraints = {
                video: {
                    facingMode: 'user', // Cámara frontal
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.videoStream;
            
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    console.log('✅ Cámara iniciada');
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('No se pudo acceder a la cámara');
        }
    },

    // Detección facial simplificada (sin librerías complejas)
    startFaceDetection() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Detección simple cada 2 segundos
        this.faceDetectionInterval = setInterval(() => {
            // Capturar frame actual
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.5);

            // Comparar con usuarios guardados
            this.checkFaceMatch(imageData);
        }, 2000);
    },

    // Verificar coincidencia facial (simplificado)
    checkFaceMatch(capturedImage) {
        const users = storage.getUsers();
        
        // En producción, aquí usarías una librería como face-api.js
        // Por ahora, simplificado para demo
        console.log('🔍 Buscando coincidencia facial...');
        
        // Simulación: detectar si hay una cara en el frame
        // En versión completa, compararíamos con las imágenes guardadas
    },

    // Cargar perfiles existentes
    loadProfiles() {
        const users = storage.getUsers();
        const profileList = document.getElementById('profile-list');
        
        if (!profileList) return;

        profileList.innerHTML = users.map(user => `
            <div class="profile-card" onclick="app.selectUser('${user.id}')">
                <div class="profile-avatar">${user.avatar}</div>
                <div class="profile-name">${user.name}</div>
            </div>
        `).join('');
    },

    // Seleccionar usuario (alternativa a reconocimiento facial)
    selectUser(userId) {
        const user = storage.getUser(userId);
        if (user) {
            console.log(`👤 Usuario seleccionado: ${user.name}`);
            this.currentUser = user;
            this.login();
        }
    },

    // Registrar nuevo usuario
    async registerNewUser() {
        const name = prompt('¿Cómo se llama el niño/niña?');
        
        if (!name) return;

        // Capturar foto del niño
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const faceImage = canvas.toDataURL('image/jpeg', 0.7);

        // Emojis aleatorios para avatar
        const avatars = ['👦', '👧', '🧒', '👶', '🦄', '🐻', '🐼', '🦁', '🐯', '🐶'];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

        // Crear usuario
        const newUser = {
            id: Date.now().toString(),
            name: name,
            avatar: randomAvatar,
            faceData: faceImage,
            createdAt: new Date().toISOString(),
            progress: {
                a: { completed: 0, stars: 0 },
                e: { completed: 0, stars: 0 },
                i: { completed: 0, stars: 0 },
                o: { completed: 0, stars: 0 },
                u: { completed: 0, stars: 0 }
            }
        };

        storage.saveUser(newUser);
        
        this.showMessage(`✅ ¡Bienvenido ${name}!`);
        this.currentUser = newUser;
        
        setTimeout(() => {
            this.login();
        }, 1500);
    },

    // Login exitoso
    login() {
        this.stopCamera();
        audioManager.play('success');
        this.showCelebration('¡Hola ' + this.currentUser.name + '!');
        
        setTimeout(() => {
            this.goToScreen('menu-screen');
            this.loadUserProgress();
        }, 2000);
    },

    // Detener cámara
    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
        }
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
        }
    },

    // Cargar progreso del usuario
    loadUserProgress() {
        if (!this.currentUser) return;

        const progress = this.currentUser.progress;
        
        // Actualizar barra de progreso general
        const totalActivities = 20; // 5 vocales x 4 actividades
        let completed = 0;
        
        Object.keys(progress).forEach(vocal => {
            completed += progress[vocal].completed;
        });

        const percentage = Math.round((completed / totalActivities) * 100);
        this.updateProgressBar(percentage);

        // Actualizar tarjetas de vocales
        Object.keys(progress).forEach(vocal => {
            const card = document.querySelector(`.vocal-card[data-vocal="${vocal}"]`);
            if (card) {
                const status = card.querySelector('.vocal-status');
                const stars = progress[vocal].stars;
                const completed = progress[vocal].completed;
                
                status.innerHTML = `
                    <span class="stars-earned">${'⭐'.repeat(stars)}${'☆'.repeat(4 - stars)}</span>
                    <span class="completion">${completed}/4</span>
                `;
            }
        });
    },

    // Actualizar barra de progreso
    updateProgressBar(percentage = 0) {
        const progressFill = document.getElementById('overall-progress');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
            progressFill.querySelector('.progress-text').textContent = percentage + '%';
        }
    },

    // Iniciar vocal
    startVocal(vocal) {
        console.log(`📚 Iniciando vocal: ${vocal.toUpperCase()}`);
        this.currentVocal = vocal;
        this.currentActivity = 0;
        
        activities.start(vocal);
    },

    // Mostrar celebración
    showCelebration(message) {
        const modal = document.getElementById('celebration-modal');
        if (modal) {
            modal.querySelector('.celebration-text').textContent = message;
            modal.classList.add('active');
            audioManager.play('success');
        }
    },

    // Cerrar modal
    closeModal() {
        const modal = document.getElementById('celebration-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Mostrar progreso
    showProgress() {
        this.goToScreen('progress-screen');
    },

    // Mostrar mensaje temporal
    showMessage(message) {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-success);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: 700;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    // Error de cámara
    showCameraError() {
        const container = document.querySelector('.login-container');
        if (container) {
            container.innerHTML = `
                <div class="logo-grande">ECO</div>
                <div class="mascota-saludo">🦜</div>
                <h1 class="title-grande">¡Ups!</h1>
                <p class="subtitle">No podemos acceder a la cámara</p>
                <p class="camera-instruction">
                    Por favor, permite el acceso a la cámara en la configuración de tu navegador.
                </p>
                <div class="profile-options" id="profile-list">
                    <!-- Perfiles existentes -->
                </div>
            `;
            this.loadProfiles();
        }
    }
};

// Iniciar app cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Exponer app globalmente
window.app = app;