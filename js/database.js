/* ============================================
   DATABASE.JS - SQLite para ECO (VERSIÓN CORREGIDA)
   ============================================ */

const database = {
    db: null,
    initialized: false,
    useLocalStorage: false, // Fallback flag

    // Inicializar base de datos
    async init() {
        console.log('🗄️ Inicializando base de datos...');

        try {
            // Intentar cargar sql.js
            await this.loadSqlJs();
            
            // Abrir DB
            this.db = await this.openDatabase();
            
            // Crear tablas
            await this.createTables();
            
            this.initialized = true;
            console.log('✅ SQLite inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error con SQLite:', error);
            console.log('⚠️ Cambiando a localStorage...');
            this.useLocalStorage = true;
            this.initLocalStorage();
            return false;
        }
    },
    createTables: function () {
    console.log("📊 Creando tablas (modo localStorage)");
},


    // Cargar sql.js desde CDN (URL corregida)
    async loadSqlJs() {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            if (window.initSqlJs) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            // ✅ URL SIN ESPACIOS
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('No se pudo cargar sql.js'));
            document.head.appendChild(script);
        });
    },

    // Abrir base de datos
    async openDatabase() {
        const SQL = await initSqlJs({
            // ✅ URL SIN ESPACIOS
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Intentar cargar DB desde localStorage
        const savedDb = localStorage.getItem('eco_sqlite_db');
        
        if (savedDb) {
            try {
                const uInt8Array = new Uint8Array(JSON.parse(savedDb));
                return new SQL.Database(uInt8Array);
            } catch (e) {
                console.warn('DB corrupta, creando nueva');
                return new SQL.Database();
            }
        } else {
            return new SQL.Database();
        }
    },

    // ========== FALLBACK LOCALSTORAGE ==========
    
    initLocalStorage() {
        if (!localStorage.getItem('eco_users')) {
            localStorage.setItem('eco_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('eco_levels')) {
            const levels = [
                { level: 1, name: "Exploradores", stars: 0 },
                { level: 2, name: "Aventureros", stars: 8 },
                { level: 3, name: "Descubridores", stars: 15 },
                { level: 4, name: "Maestros", stars: 24 },
                { level: 5, name: "Expertos", stars: 32 }
            ];
            localStorage.setItem('eco_levels', JSON.stringify(levels));
        }
        console.log('✅ localStorage inicializado');
    },

    // ========== MÉTODOS COMPATIBLES (SQLite + localStorage) ==========

    createUser(name, avatar, faceData) {
        if (this.useLocalStorage) {
            const users = JSON.parse(localStorage.getItem('eco_users') || '[]');
            const newUser = {
                id: Date.now(),
                name,
                avatar,
                faceData,
                currentLevel: 1,
                totalStars: 0,
                createdDate: new Date().toISOString().split('T')[0]
            };
            users.push(newUser);
            localStorage.setItem('eco_users', JSON.stringify(users));
            console.log(`✅ Usuario creado: ${name} (ID: ${newUser.id})`);
            return newUser.id;
        } else {
            try {
                this.db.run(
                    `INSERT INTO users (name, avatar, face_data, current_level, total_stars)
                     VALUES (?, ?, ?, 1, 0)`,
                    [name, avatar, faceData]
                );
                this.saveToLocalStorage();
                const result = this.db.exec("SELECT last_insert_rowid() as id");
                const userId = result[0].values[0][0];
                console.log(`✅ Usuario creado: ${name} (ID: ${userId})`);
                return userId;
            } catch (error) {
                console.error('Error al crear usuario:', error);
                return null;
            }
        }
    },

    getAllUsers() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('eco_users') || '[]');
        } else {
            try {
                const result = this.db.exec(`
                    SELECT id, name, avatar, current_level, total_stars, 
                           strftime('%Y-%m-%d', created_at) as created_date
                    FROM users ORDER BY created_at DESC
                `);
                
                if (!result[0]) return [];
                
                return result[0].values.map(row => ({
                    id: row[0],
                    name: row[1],
                    avatar: row[2],
                    currentLevel: row[3],
                    totalStars: row[4],
                    createdDate: row[5]
                }));
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
                return [];
            }
        }
    },

    getUser(userId) {
        if (this.useLocalStorage) {
            const users = JSON.parse(localStorage.getItem('eco_users') || '[]');
            return users.find(u => u.id == userId) || null;
        } else {
            try {
                const result = this.db.exec(
                    `SELECT id, name, avatar, face_data, current_level, total_stars, total_time
                     FROM users WHERE id = ?`,
                    [userId]
                );
                
                if (!result[0]) return null;
                
                const row = result[0].values[0];
                return {
                    id: row[0],
                    name: row[1],
                    avatar: row[2],
                    faceData: row[3],
                    currentLevel: row[4],
                    totalStars: row[5],
                    totalTime: row[6]
                };
            } catch (error) {
                console.error('Error al obtener usuario:', error);
                return null;
            }
        }
    },

    saveToLocalStorage() {
        if (this.db && !this.useLocalStorage) {
            try {
                const data = this.db.export();
                const buffer = Array.from(data);
                localStorage.setItem('eco_sqlite_db', JSON.stringify(buffer));
            } catch (error) {
                console.error('Error al guardar DB:', error);
            }
        }
    },

    clearDatabase() {
        if (confirm('⚠️ ¿Estás seguro? Se borrarán TODOS los datos.')) {
            if (this.useLocalStorage) {
                localStorage.removeItem('eco_users');
                localStorage.removeItem('eco_levels');
            } else {
                this.db.run("DELETE FROM users");
                this.db.run("DELETE FROM vocal_progress");
                this.db.run("DELETE FROM achievements");
                this.saveToLocalStorage();
            }
            console.log('🗑️ Base de datos limpiada');
            return true;
        }
        return false;
    }
};

// Inicializar automáticamente
database.init().then(() => {
    console.log('🦜 ECO Database lista para usar');
});

// Exponer globalmente
window.database = database;