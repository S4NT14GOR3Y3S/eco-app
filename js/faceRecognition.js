/* ============================================
   FACE RECOGNITION v3 - CORREGIDO
   - IDs únicos por contexto (login vs registro)
   - Auto-reconocimiento confiable
   - Gestión limpia del stream de cámara
   ============================================ */

const faceRecognition = {
    videoStream: null,
    isCapturing: false,
    modelsLoaded: false,
    modelsLoading: false,
    activeVideoId: null,
    activeCanvasId: null,
    MODEL_URL: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
    recognitionTimer: null,

    async loadModels() {
        if (this.modelsLoaded) return true;
        if (this.modelsLoading) {
            return new Promise(resolve => {
                const check = setInterval(() => {
                    if (this.modelsLoaded) { clearInterval(check); resolve(true); }
                    if (!this.modelsLoading) { clearInterval(check); resolve(false); }
                }, 200);
            });
        }
        this.modelsLoading = true;
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
            ]);
            this.modelsLoaded = true;
            this.modelsLoading = false;
            console.log('✅ Modelos faciales cargados');
            return true;
        } catch(e) {
            this.modelsLoading = false;
            console.error('❌ Error cargando modelos:', e);
            return false;
        }
    },

    stop() {
        this.stopAutoRecognition();
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(t => t.stop());
            this.videoStream = null;
        }
        ['login-face-video', 'register-face-video'].forEach(id => {
            const v = document.getElementById(id);
            if (v) v.srcObject = null;
        });
        this.activeVideoId = null;
        console.log('📷 Cámara detenida');
    },

    async init(videoId, canvasId, indicatorId) {
        if (this.videoStream && this.activeVideoId === videoId) {
            const video = document.getElementById(videoId);
            if (video && video.srcObject) return true;
        }
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(t => t.stop());
            this.videoStream = null;
        }
        this.activeVideoId = videoId;
        this.activeCanvasId = canvasId;

        const video = document.getElementById(videoId);
        const ind = indicatorId ? document.getElementById(indicatorId) : null;
        if (!video) { console.warn('Video no encontrado:', videoId); return false; }
        if (ind) ind.textContent = '⏳ Iniciando cámara...';

        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
                audio: false
            });
            video.srcObject = this.videoStream;
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = () => video.play().then(resolve).catch(reject);
                setTimeout(reject, 6000);
            });
            if (ind) ind.textContent = '⏳ Cargando reconocimiento...';
            const ok = await this.loadModels();
            if (!ok) {
                if (ind) ind.textContent = '❌ Error IA – usa tu perfil abajo';
                return false;
            }
            if (ind) ind.textContent = '📸 Mira a la cámara...';
            return true;
        } catch(e) {
            console.warn('Cámara no disponible:', e.message);
            if (ind) ind.textContent = '📷 Sin cámara – toca tu perfil abajo';
            return false;
        }
    },

    euclidean(a, b) {
        let s = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) s += (a[i] - b[i]) ** 2;
        return Math.sqrt(s);
    },

    async registerFace(userName, avatar) {
        const videoId = 'register-face-video';
        const vid = document.getElementById(videoId);
        if (!vid || !this.videoStream) {
            await this.init(videoId, 'register-face-canvas', null);
        }
        const video = document.getElementById(videoId);
        let descriptor = null;
        for (let i = 0; i < 10; i++) {
            try {
                const det = await faceapi
                    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.3 }))
                    .withFaceLandmarks(true).withFaceDescriptor();
                if (det) { descriptor = det.descriptor; break; }
            } catch(e) {}
            await new Promise(r => setTimeout(r, 500));
        }
        if (!descriptor) throw new Error('No se detectó cara. Mira a la cámara con buena luz.');
        const newUser = {
            id: Date.now().toString(), name: userName, avatar: avatar,
            faceDescriptor: Array.from(descriptor),
            createdAt: new Date().toISOString(), currentLevel: 1, totalStars: 0,
            progress: {
                a: { completed: 0, stars: 0, attempts: 0 },
                e: { completed: 0, stars: 0, attempts: 0 },
                i: { completed: 0, stars: 0, attempts: 0 },
                o: { completed: 0, stars: 0, attempts: 0 },
                u: { completed: 0, stars: 0, attempts: 0 }
            }
        };
        storage.saveUser(newUser);
        console.log('✅ Usuario registrado con cara:', userName);
        return newUser;
    },

    startAutoRecognition(videoId, canvasId, indicatorId, callback, interval) {
        if (this.isCapturing) return;
        this.isCapturing = true;
        interval = interval || 1800;

        const check = async () => {
            if (!this.isCapturing) return;
            const video = document.getElementById(videoId);
            const canvas = document.getElementById(canvasId);
            const ind = indicatorId ? document.getElementById(indicatorId) : null;

            if (!video || !this.videoStream || !this.modelsLoaded) {
                if (this.isCapturing) this.recognitionTimer = setTimeout(check, interval);
                return;
            }
            try {
                const det = await faceapi
                    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.3 }))
                    .withFaceLandmarks(true).withFaceDescriptor();

                if (canvas) {
                    canvas.width = video.videoWidth || 320;
                    canvas.height = video.videoHeight || 240;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (det) {
                        const b = det.detection.box;
                        ctx.strokeStyle = '#7ED321'; ctx.lineWidth = 3;
                        ctx.strokeRect(b.x, b.y, b.width, b.height);
                    }
                }
                if (det) {
                    const users = storage.getUsers() || [];
                    let bestMatch = null, bestDist = Infinity;
                    for (const u of users) {
                        if (!u.faceDescriptor || !u.faceDescriptor.length) continue;
                        try {
                            const stored = new Float32Array(u.faceDescriptor);
                            const dist = this.euclidean(det.descriptor, stored);
                            if (dist < bestDist) { bestDist = dist; bestMatch = u; }
                        } catch(e) {}
                    }
                    if (bestMatch && bestDist < 0.52) {
                        if (ind) ind.textContent = '✅ ¡Hola, ' + bestMatch.name + '!';
                        this.isCapturing = false;
                        clearTimeout(this.recognitionTimer);
                        setTimeout(() => callback(bestMatch), 700);
                        return;
                    } else {
                        if (ind) ind.textContent = '🔍 Buscando tu perfil...';
                    }
                } else {
                    if (ind) ind.textContent = '📸 Mira a la cámara...';
                }
            } catch(e) {}
            if (this.isCapturing) this.recognitionTimer = setTimeout(check, interval);
        };
        check();
    },

    stopAutoRecognition() {
        this.isCapturing = false;
        if (this.recognitionTimer) { clearTimeout(this.recognitionTimer); this.recognitionTimer = null; }
    }
};
window.faceRecognition = faceRecognition;
