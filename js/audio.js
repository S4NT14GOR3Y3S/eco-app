/* ============================================
   AUDIO.JS - Gestor de Audio de ECO
   ============================================ */

const audioManager = {
    // Configuración
    sounds: {},
    volume: 0.8,
    muted: false,
    synthVoice: null,

    // Rutas de audio
    PATHS: {
        vocales: 'assets/audio/vocales/',
        feedback: 'assets/audio/feedback/'
    },

    // Inicializar
    init() {
        console.log('🔊 Inicializando audio...');
        
        // Cargar configuración de volumen
        const settings = Storage.getSettings();
        this.volume = settings.volume || 0.8;

        // Inicializar síntesis de voz
        this.initSpeechSynthesis();

        // Pre-cargar sonidos críticos
        this.preloadSounds();

        console.log('✅ Audio inicializado');
    },

    // Inicializar síntesis de voz (Text-to-Speech)
    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            // Esperar a que las voces estén disponibles
            const loadVoices = () => {
                const voices = speechSynthesis.getVoices();
                // Buscar voz en español
                this.synthVoice = voices.find(voice => 
                    voice.lang.startsWith('es')
                ) || voices[0];
                
                console.log('🗣️ Voz seleccionada:', this.synthVoice?.name);
            };

            // Las voces pueden no estar disponibles inmediatamente
            if (speechSynthesis.getVoices().length > 0) {
                loadVoices();
            } else {
                speechSynthesis.onvoiceschanged = loadVoices;
            }
        } else {
            console.warn('⚠️ Text-to-Speech no disponible en este navegador');
        }
    },

    // Pre-cargar sonidos importantes
    preloadSounds() {
        // Sonidos de feedback
        this.loadSound('success', this.PATHS.feedback + 'success.mp3');
        this.loadSound('error', this.PATHS.feedback + 'error.mp3');
        this.loadSound('click', this.PATHS.feedback + 'click.mp3');
        this.loadSound('complete', this.PATHS.feedback + 'complete.mp3');

        // Las vocales se cargarán bajo demanda
    },

    // Cargar un sonido
    loadSound(name, url) {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = this.volume;
            
            // Manejar si el archivo no existe
            audio.onerror = () => {
                console.warn(`⚠️ No se pudo cargar: ${url}`);
                // Crear silencio como fallback
                this.sounds[name] = null;
            };

            audio.oncanplaythrough = () => {
                this.sounds[name] = audio;
                console.log(`✅ Sonido cargado: ${name}`);
            };

            audio.src = url;
        } catch (error) {
            console.error(`Error al cargar ${name}:`, error);
            this.sounds[name] = null;
        }
    },

    // Reproducir sonido
    play(soundName) {
        if (this.muted) return;

        const sound = this.sounds[soundName];
        
        if (sound) {
            // Clonar el audio para poder reproducir múltiples veces simultáneamente
            const audioClone = sound.cloneNode();
            audioClone.volume = this.volume;
            audioClone.play().catch(err => {
                console.warn('Error al reproducir:', err);
            });
        } else {
            console.warn(`⚠️ Sonido no encontrado: ${soundName}`);
        }
    },

    // Pronunciar vocal usando Text-to-Speech
    speakVocal(vocal) {
        if (this.muted) return;

        if ('speechSynthesis' in window) {
            // Cancelar cualquier habla en curso
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(vocal.toUpperCase());
            utterance.voice = this.synthVoice;
            utterance.lang = 'es-ES';
            utterance.rate = 0.7; // Más lento para claridad
            utterance.pitch = 1.2; // Tono ligeramente más alto
            utterance.volume = this.volume;

            speechSynthesis.speak(utterance);
            console.log(`🗣️ Pronunciando: ${vocal}`);
        } else {
            // Fallback: intentar reproducir archivo de audio
            this.playVocalAudio(vocal);
        }
    },

    // Reproducir audio de vocal desde archivo
    playVocalAudio(vocal) {
        const soundName = `vocal_${vocal}`;
        
        // Si no está cargado, cargar ahora
        if (!this.sounds[soundName]) {
            const url = `${this.PATHS.vocales}${vocal}.mp3`;
            this.loadSound(soundName, url);
            
            // Esperar un momento y reproducir
            setTimeout(() => {
                this.play(soundName);
            }, 500);
        } else {
            this.play(soundName);
        }
    },

    // Pronunciar palabra completa
    speakWord(word) {
        if (this.muted) return;

        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(word);
            utterance.voice = this.synthVoice;
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = this.volume;

            speechSynthesis.speak(utterance);
        }
    },

    // Pronunciar frase con emoción
    speakPhrase(phrase, emotion = 'neutral') {
        if (this.muted) return;

        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.voice = this.synthVoice;
            utterance.lang = 'es-ES';
            
            // Ajustar parámetros según emoción
            switch (emotion) {
                case 'happy':
                    utterance.rate = 1.0;
                    utterance.pitch = 1.3;
                    break;
                case 'encouraging':
                    utterance.rate = 0.9;
                    utterance.pitch = 1.1;
                    break;
                case 'calm':
                    utterance.rate = 0.7;
                    utterance.pitch = 0.9;
                    break;
                default:
                    utterance.rate = 0.8;
                    utterance.pitch = 1.0;
            }
            
            utterance.volume = this.volume;
            speechSynthesis.speak(utterance);
        }
    },

    // Reproducir sonido de éxito
    playSuccess() {
        this.play('success');
        this.speakPhrase('¡Muy bien!', 'happy');
    },

    // Reproducir sonido de error suave
    playError() {
        this.play('error');
        this.speakPhrase('Intenta otra vez', 'encouraging');
    },

    // Reproducir sonido de completado
    playComplete() {
        this.play('complete');
        this.speakPhrase('¡Excelente trabajo!', 'happy');
    },

    // Reproducir click
    playClick() {
        this.play('click');
    },

    // Establecer volumen
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Actualizar todos los sonidos cargados
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = this.volume;
        });

        // Guardar en configuración
        Storage.updateSettings({ volume: this.volume });
        console.log(`🔊 Volumen: ${Math.round(this.volume * 100)}%`);
    },

    // Silenciar/desilenciar
    toggleMute() {
        this.muted = !this.muted;
        console.log(this.muted ? '🔇 Silenciado' : '🔊 Audio activado');
        return this.muted;
    },

    // Detener todo el audio
    stopAll() {
        // Detener síntesis de voz
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }

        // Detener todos los sonidos
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    },

    // Reproducir secuencia de sonidos de vocal
    playVocalSequence(vocal, times = 3, delay = 1000) {
        let count = 0;
        
        const playNext = () => {
            if (count < times && !this.muted) {
                this.speakVocal(vocal);
                count++;
                setTimeout(playNext, delay);
            }
        };

        playNext();
    },

    // Reproducir instrucción de actividad
    playInstruction(activityType, vocal) {
        const instructions = {
            'listen': `Vamos a aprender la vocal ${vocal.toUpperCase()}. Escucha con atención.`,
            'trace': `Ahora vas a trazar la letra ${vocal.toUpperCase()} con tu dedo.`,
            'find': `Encuentra las cosas que empiezan con ${vocal.toUpperCase()}.`,
            'memory': `Juguemos a encontrar los pares. ¡Tú puedes!`
        };

        const instruction = instructions[activityType];
        if (instruction) {
            this.speakPhrase(instruction, 'calm');
        }
    },

    // Efecto de sonido generado (para cuando no hay archivos)
    playTone(frequency = 440, duration = 200, type = 'sine') {
        if (this.muted) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.value = this.volume * 0.3; // Más suave

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Error al generar tono:', error);
        }
    },

    // Melodía de celebración
    playCelebrationMelody() {
        const notes = [
            { freq: 523, duration: 150 }, // Do
            { freq: 659, duration: 150 }, // Mi
            { freq: 784, duration: 150 }, // Sol
            { freq: 1047, duration: 300 }  // Do (octava alta)
        ];

        let delay = 0;
        notes.forEach(note => {
            setTimeout(() => {
                this.playTone(note.freq, note.duration, 'sine');
            }, delay);
            delay += note.duration + 50;
        });
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => audioManager.init());
} else {
    audioManager.init();
}

// Exponer globalmente
window.audioManager = audioManager;