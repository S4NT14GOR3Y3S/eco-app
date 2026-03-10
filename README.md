# 🦜 ECO - Educación Cognitiva Optimizada

> Aplicación educativa **100% gratuita** para el aprendizaje de vocales en niños con discapacidad cognitiva moderada.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Enabled-green.svg)](https://web.dev/progressive-web-apps/)
[![Offline](https://img.shields.io/badge/Offline-Ready-orange.svg)](service-worker.js)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Tecnologías](#️-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- ✅ **Login con Reconocimiento Facial** - Acceso sin contraseñas, solo mira a la cámara
- ✅ **Navegación Visual Intuitiva** - Botones gigantes con emojis y colores
- ✅ **4 Actividades por Vocal** - Ver, trazar, encontrar y jugar
- ✅ **Feedback Auditivo** - Text-to-Speech nativo para pronunciación
- ✅ **Progreso Personalizado** - Seguimiento individual de cada niño
- ✅ **Sistema de Recompensas** - Estrellas y celebraciones motivadoras

### 📱 Progressive Web App (PWA)

- ✅ **Funciona Sin Internet** - Service Worker para uso offline
- ✅ **Instalable** - Se instala como app nativa en celular/tablet
- ✅ **Ligera** - Solo ~3 MB de tamaño total
- ✅ **Multiplataforma** - Android, iOS, Windows, macOS, Linux

### ♿ Diseño Inclusivo

- ✅ **Alto Contraste** - Ratio 7:1 (WCAG AAA)
- ✅ **Fuentes Grandes** - Mínimo 24px para legibilidad
- ✅ **Colores por Vocal** - Asociación mnemotécnica
- ✅ **Sin Distracciones** - Interfaz minimalista

---

## 🎬 Demo

### Capturas de Pantalla

```
[Aquí irían las capturas de pantalla]
```

### Probar Online

🌐 **Demo en vivo:** [https://tu-usuario.github.io/eco-app](https://tu-usuario.github.io/eco-app)

---

## 🚀 Instalación

### Opción 1: Usar Online (Recomendado)

1. Visita: [URL de tu app]
2. En dispositivo móvil:
   - **Android:** Chrome mostrará "Agregar a pantalla de inicio"
   - **iOS:** Safari → Compartir → "Añadir a pantalla de inicio"
3. ¡Listo! La app funcionará offline

### Opción 2: Instalar Localmente

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/eco-app.git

# Entrar al directorio
cd eco-app

# Abrir index.html en el navegador
# O usar un servidor local:
python -m http.server 8000
# Luego abrir: http://localhost:8000
```

### Opción 3: Distribuir Sin Internet

Para fundaciones sin internet:

1. Descarga el repositorio como ZIP
2. Copia la carpeta `eco-app` a una USB/tarjeta SD
3. En el dispositivo, abre `index.html` con Chrome/Safari
4. Agrega a pantalla de inicio
5. ¡Funciona offline!

---

## 📖 Uso

### Para Niños

1. **Primera vez:**
   - Abre la app
   - Mira a la cámara
   - ¡Ya puedes entrar!

2. **Aprender vocales:**
   - Toca la vocal que quieres aprender
   - Completa las 4 actividades
   - Gana estrellas

3. **Próximas veces:**
   - La app te reconoce automáticamente
   - Continúa donde te quedaste

### Para Educadores/Padres

1. **Registrar niños:**
   - Botón "NUEVO NIÑO"
   - Capturar foto con la cámara
   - Ingresar nombre

2. **Ver progreso:**
   - Icono 📊 en la esquina
   - Ver estadísticas detalladas
   - Exportar reportes

3. **Configuración:**
   - Ajustar volumen
   - Activar/desactivar vibraciones

---

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones
- **JavaScript (Vanilla)** - Lógica sin frameworks

### APIs del Navegador
- **Web Speech API** - Text-to-Speech y reconocimiento de voz
- **MediaDevices API** - Acceso a cámara para reconocimiento facial
- **IndexedDB** - Almacenamiento local de progreso
- **Service Workers** - Funcionalidad offline
- **Canvas API** - Actividad de trazar letras

### PWA
- **Manifest.json** - Configuración de instalación
- **Service Worker** - Cache y offline

---

## 📂 Estructura del Proyecto

```
eco-app/
├── index.html              # Página principal
├── manifest.json           # Configuración PWA
├── service-worker.js       # Para funcionar offline
├── README.md              # Este archivo
├── .gitignore             # Archivos ignorados por Git
│
├── css/
│   ├── colors.css         # Variables de colores
│   ├── styles.css         # Estilos principales
│   └── animations.css     # Animaciones CSS
│
├── js/
│   ├── app.js             # Lógica principal + Login
│   ├── storage.js         # Almacenamiento local
│   ├── audio.js           # Manejo de audio
│   └── activities.js      # 4 actividades educativas
│
├── assets/
│   ├── images/
│   │   ├── vocales/       # Imágenes de A, E, I, O, U
│   │   ├── objetos/       # Manzana, elefante, etc.
│   │   └── ui/            # Logo, iconos
│   ├── audio/
│   │   ├── vocales/       # Pronunciaciones (MP3)
│   │   └── feedback/      # Sonidos de éxito/error
│   └── fonts/             # Fuentes personalizadas
│
└── docs/
    └── manual.pdf         # Manual del educador
```

---

## 💻 Desarrollo

### Requisitos

- Navegador moderno (Chrome, Firefox, Safari)
- Editor de código (VS Code recomendado)
- Git

### Ejecutar Localmente

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/eco-app.git
cd eco-app

# 2. Abrir con Live Server (VS Code)
# O usar Python:
python -m http.server 8000

# 3. Abrir en navegador
http://localhost:8000
```

### Testing

```bash
# Testing manual:
# - Probar en Chrome, Firefox, Safari
# - Probar en dispositivo móvil real
# - Probar modo offline (DevTools → Network → Offline)

# Testing de PWA:
# Chrome DevTools → Application → Manifest
# Lighthouse → Performance, Accessibility, PWA
```

### Build (Opcional)

ECO funciona directamente sin build. Pero si quieres optimizar:

```bash
# Minificar CSS y JS (opcional)
npm install -g minify
minify css/styles.css > css/styles.min.css
minify js/app.js > js/app.min.js
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Cómo Contribuir

1. **Fork** este repositorio
2. Crea una **rama**: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Añade nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request**

### Áreas de Mejora

- [ ] Agregar más idiomas (inglés, portugués, francés)
- [ ] Implementar consonantes
- [ ] Modo multi-jugador local
- [ ] Más mini-juegos educativos
- [ ] Personalización de avatares
- [ ] Sincronización opcional con Google Drive
- [ ] Analytics de progreso más detallados

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2026 Proyecto ECO

Se concede permiso, sin cargo, a cualquier persona que obtenga una copia...
```

---

## 🙏 Agradecimientos

Este proyecto fue creado con amor para:
- Fundaciones que trabajan con niños con discapacidad cognitiva
- Educadores especializados que necesitan herramientas gratuitas
- Familias que buscan apoyar el aprendizaje de sus hijos

---

## 📞 Contacto

- **Email:** [tu-email@ejemplo.com]
- **GitHub Issues:** [https://github.com/tu-usuario/eco-app/issues]
- **Documentación:** [Wiki del proyecto]

---

## 🗺️ Roadmap

### Versión 1.0 (Actual)
- ✅ 5 vocales con 4 actividades cada una
- ✅ Login con reconocimiento facial
- ✅ Funciona offline
- ✅ PWA instalable

### Versión 1.1 (Próxima)
- [ ] Consonantes (M, P, S, L, T)
- [ ] Formación de sílabas
- [ ] Modo práctica libre

### Versión 2.0 (Futuro)
- [ ] Palabras completas
- [ ] Frases simples
- [ ] Cuentos interactivos

---

**Desarrollado con ❤️ para la educación inclusiva**

**Proyecto ECO - Febrero 2026**