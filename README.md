# Red Vecinal

Red vecinal de alertas y apoyo mutuo. Plataforma anónima para que vecinas y vecinos puedan reportar situaciones de riesgo, coordinar apoyo en tiempo real y fortalecer la seguridad comunitaria desde la solidaridad de barrio.

El sitio incluye un **mapa interactivo** donde cualquier persona puede crear alertas anónimas, ver incidentes cercanos, asistir a otras personas que necesitan apoyo y mantenerse informada de lo que ocurre en su entorno.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | [React 19](https://react.dev/) + TypeScript + [Vite](https://vite.dev/) |
| Servidor | Node.js + [Express](https://expressjs.com/) |
| Base de datos | MySQL 8.0 (`mysql2` + Docker Compose) |
| Mapas | Leaflet.js + MarkerCluster |
| Mobile | [Capacitor](https://capacitorjs.com/) (APK Android) |
| PWA | `vite-plugin-pwa` (instalable offline) |
| Traducciones | i18next + react-i18next (7 idiomas) |
| Identificación | Fingerprint SHA-256 (canvas + UA + screen) |

## Requisitos previos

Antes de empezar, necesitas instalar **Node.js**, **npm** y **MySQL 8.0** (puede ser local o con Docker).

### Instalar Node.js y npm

#### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install -y nodejs npm
node --version
npm --version
```

#### Linux (Fedora / RHEL)

```bash
sudo dnf install -y nodejs npm
node --version
npm --version
```

#### Linux (Arch Linux)

```bash
sudo pacman -S nodejs npm
node --version
npm --version
```

#### macOS

Opción A — Con [Homebrew](https://brew.sh/) (recomendado):
```bash
brew install node
node --version
npm --version
```

Opción B — Descargar instalador desde [nodejs.org](https://nodejs.org/)

#### Windows

Descarga el instalador LTS desde [nodejs.org](https://nodejs.org/) y ejecútalo. Asegúrate de marcar la opción que instala las herramientas de compilación (build tools). Tras la instalación, abre una terminal (PowerShell o CMD) y verifica:

```cmd
node --version
npm --version
```

### Instalar Docker (recomendado para MySQL)

**Linux (Ubuntu/Debian):**
```bash
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

**macOS:** Descarga [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Windows:** Descarga [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Verifica la instalación:
```bash
docker --version
docker compose version
```

> **Alternativa:** Si ya tienes MySQL 8.0 instalado localmente, puedes usarlo directamente configurando las variables de entorno en el `.env`. No necesitas Docker.

---

## Paso a paso para ejecutar el proyecto

### 1. Clonar el repositorio

```bash
cd ~/Escritorio
git clone <URL_DEL_REPOSITORIO>
cd redvecinal
```

### 2. Instalar dependencias

El proyecto tiene dos `package.json`: raíz (frontend) y `server/` (API).

```bash
# Frontend
npm install

# API
cd server && npm install && cd ..
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Ajusta las credenciales MySQL si es necesario:

```
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=redvecinal
DB_PASSWORD=redvecinal_pass
DB_NAME=redvecinal
```

> Las credenciales por defecto coinciden con las de `docker-compose.yml`. Si usas MySQL local, cambia `DB_PORT` a `3306` y ajusta usuario/contraseña.

### 4. Arrancar MySQL y la API

#### Opción A — Con Docker (recomendado)

```bash
# Arrancar MySQL
npm run dev:docker

# Arrancar la API
npm run dev:api
```

Esto crea un contenedor con MySQL 8.0, la base de datos, el usuario y las tablas automáticamente mediante `sql/init/`. La API Express escucha en `http://localhost:3001`.

#### Opción B — Con MySQL local

Si ya tienes MySQL 8.0 instalado, crea la base de datos y el usuario:

```sql
CREATE DATABASE IF NOT EXISTS redvecinal;
CREATE USER IF NOT EXISTS 'redvecinal'@'%' IDENTIFIED BY 'redvecinal_pass';
GRANT ALL PRIVILEGES ON redvecinal.* TO 'redvecinal'@'%';
FLUSH PRIVILEGES;
```

Luego ejecuta los scripts SQL en orden:

```bash
mysql -u root -p redvecinal < sql/init/00001_schema.sql
mysql -u root -p redvecinal < sql/init/00002_triggers.sql
mysql -u root -p redvecinal < sql/init/00003_cleanup.sql
```

Y arranca la API:

```bash
npm run dev:api
```

### 5. Arrancar el frontend

En otra terminal:

```bash
npm run dev
```

El frontend arranca en `http://localhost:5173/`. Las peticiones `/api` se proxydan automáticamente a la API en `:3001`.

### 6. Abrir en el navegador

Abre `http://localhost:5173/` en tu navegador.

### 7. Construir para producción

```bash
npm run build
```

Esto genera los archivos optimizados en `dist/`.

### 8. Previsualizar la build de producción

```bash
npm run preview
```

---

## Estructura del proyecto

```
redvecinal/
├── server/                     # API Express
│   ├── index.js                # Servidor (rutas, CORS, inicio)
│   ├── db.js                   # Conexión MySQL (pool)
│   ├── models.js               # Consultas a la base de datos
│   ├── Dockerfile              # Build para deploy
│   └── package.json
├── sql/init/                   # Scripts SQL
│   ├── 00001_schema.sql        # Tablas alertas + assists
│   ├── 00002_triggers.sql      # Triggers de contadores
│   └── 00003_cleanup.sql       # Evento limpieza expiradas
├── src/
│   ├── components/
│   │   ├── MapView.tsx         # Mapa Leaflet + alertas + ubicación
│   │   ├── CreateAlertModal.tsx # Modal de creación de alerta
│   │   ├── NearbyAlertsSidebar.tsx # Panel alertas cercanas
│   │   ├── LanguageSwitcher.tsx # Selector de idioma
│   │   └── Logo.tsx           # Logo SVG
│   ├── i18n/
│   │   ├── i18n.ts             # Configuración i18next
│   │   └── locales/            # Traducciones (7 idiomas)
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP para la API
│   │   ├── fingerprint.ts      # Identificador anónimo del navegador
│   │   ├── geo.ts              # Utilidades geo (haversine, point-in-polygon)
│   │   └── spain.json          # GeoJSON límites de España
│   └── pages/
│       └── HomePage.tsx        # Página principal
├── android/                    # Proyecto Android (Capacitor)
├── docker-compose.yml          # MySQL 8.0 en contenedor
├── capacitor.config.ts         # Config Capacitor
├── vite.config.ts              # Config Vite (proxy, PWA)
├── package.json                # Dependencias frontend
└── .env.example                # Variables de entorno de ejemplo
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Frontend Vite con hot-reload |
| `npm run dev:api` | API Express con `--watch` |
| `npm run dev:docker` | Arranca MySQL en Docker |
| `npm run build` | Build producción (TypeScript + Vite) |
| `npm run build:mobile` | Build + sincronizar con Capacitor |
| `npm run preview` | Previsualiza la build de producción |
| `npm run lint` | ESLint |

## Despliegue

### Web

El frontend se despliega como estático (`dist/`) en cualquier servidor (Vercel, Netlify, etc.).

La API Express se despliega con Docker o Node.js directo. El `Dockerfile` en `server/` construye la imagen:

```bash
docker build -t redvecinal-api ./server
docker run -p 3001:3001 redvecinal-api
```

### APK Android

```bash
npm run build:mobile   # Build web + sync Capacitor
cd android && ./gradlew assembleDebug   # Genera APK
```

La APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Seguridad y anti-spam

### Fingerprint del navegador

Cada usuaria genera un identificador anónimo basado en características de su dispositivo:

- Canvas fingerprinting
- User agent
- Profundidad de color
- Idioma del sistema

Estos datos se combinan y se hashean con SHA-256. **No se almacena ningún dato personal.**

### Límite de creación

El servidor permite máximo **2 alertas cada 5 minutos** por fingerprint para evitar spam.

### Asistencia única

Cada persona solo puede tener **una asistencia activa** a la vez. Si ya estás asistiendo una alerta, no puedes asistir otra hasta que te retires.

### Validación de campos

El servidor rechaza peticiones incompletas (`400`) si faltan campos obligatorios: `lat`, `lng`, `severity`, `duration` o `fingerprint_hash`.

### Expiración automática

Las alertas se eliminan automáticamente al alcanzar su fecha de expiración (configurable: 15 min, 1 h, 6 h, 24 h). Un evento MySQL limpia las expiradas cada hora.

## Privacidad

- **No hay registro de usuarios** — no se pide email, nombre ni teléfono
- **No hay cookies de seguimiento** — solo localStorage para el idioma y preferencias
- **No se almacena la ubicación** — las coordenadas se asocian a la alerta, no al perfil
- **No se comparten datos con terceros**
- El mapa usa OpenStreetMap (gratuito, sin API key)

## Cómo contribuir

### Clonar el repositorio

**HTTPS:**
```bash
git clone https://github.com/<usuario>/redvecinal.git
```

**SSH (recomendado):**
```bash
git clone git@github.com:<usuario>/redvecinal.git
```

### Configurar una clave SSH en GitHub

#### 1. Generar una clave SSH

```bash
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
```

Pulsa Enter para usar la ruta por defecto y para no poner passphrase.

#### 2. Copiar la clave pública

```bash
cat ~/.ssh/id_ed25519.pub
```

#### 3. Añadir la clave a GitHub

1. Ve a [Settings > SSH and GPG keys](https://github.com/settings/keys)
2. "New SSH key"
3. Pega la clave y guarda

#### 4. Acceso al repositorio

**Opción A — Colaborador directo:** El propietario te invita desde `Settings > Collaborators`.

**Opción B — Fork + PR:** Haz fork, trabaja en tu copia, abre un Pull Request.

#### 5. Verificar la conexión

```bash
ssh -T git@github.com
```

### Flujo de contribución

1. Crea una rama:
   ```bash
   git checkout -b feature/mi-funcionalidad
   ```
2. Haz cambios y verifica:
   ```bash
   npm run dev      # frontend
   npm run dev:api  # api
   ```
3. Commit:
   ```bash
   git add .
   git commit -m "feat: añadir filtro por severidad"
   ```
4. Sube la rama:
   ```bash
   git push -u origin feature/mi-funcionalidad
   ```
5. Abre un Pull Request en GitHub.

### Convenciones de commit

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un bug |
| `docs:` | Cambios en documentación |
| `style:` | Cambios de estilo |
| `refactor:` | Refactorización de código |
| `chore:` | Tareas de mantenimiento |

## Licencia

[![CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Este proyecto está bajo la licencia **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International).

Puedes compartir y adaptar el contenido **para fines no comerciales**, siempre que reconozcas la autoría y compartas las modificaciones bajo la misma licencia.

El texto completo de la licencia está disponible en el archivo [`LICENSE`](./LICENSE).
