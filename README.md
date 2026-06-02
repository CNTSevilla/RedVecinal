# Familias Palmete - Vivienda Digna

Web de denuncia y organización vecinal por vivienda digna. Nace de la victoria de **11 familias del barrio de Palmete (Sevilla)** que frenaron desahucios ilegales y consiguieron alquileres VPO de **200€/mes**.

El sitio incluye un **mapa interactivo** donde cualquier persona puede reportar alquileres abusivos en Andalucía, ver la situación de la vivienda en Sevilla, conocer la historia de la victoria de Palmete y organizarse colectivamente.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | [Astro 4](https://astro.build/) (SSR) |
| Servidor | Node.js (`@astrojs/node`, modo standalone) |
| Base de datos | MySQL 8.0 (`mysql2` + Docker Compose) |
| Mapas | Leaflet.js + MarkerCluster + Heatmap |
| Autenticación | Token base64 (30 min expiración) |

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
cd FamiliasPalmete
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

O créalo manualmente:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TuContraseñaSegura

DB_HOST=localhost
DB_PORT=3306
DB_USER=familiaspalmete
DB_PASSWORD=familiaspalmete
DB_NAME=familiaspalmete
```

### 4. Arrancar MySQL

#### Opción A — Con Docker (recomendado)

```bash
docker compose up -d
```

Esto crea un contenedor con MySQL 8.0, la base de datos, el usuario y las tablas automáticamente mediante `db/init.sql`.

#### Opción B — Con MySQL local

```sql
CREATE DATABASE IF NOT EXISTS familiaspalmete;
CREATE USER IF NOT EXISTS 'familiaspalmete'@'%' IDENTIFIED BY 'familiaspalmete';
GRANT ALL PRIVILEGES ON familiaspalmete.* TO 'familiaspalmete'@'%';
FLUSH PRIVILEGES;
```

Luego crea la tabla:

```bash
mysql -u root -p familiaspalmete < db/init.sql
```

### 5. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre `http://localhost:4321/` en tu navegador.

### 6. Construir para producción

```bash
npm run build
```

### 7. Previsualizar la build de producción

```bash
npm run preview
```

---

## Estructura del proyecto

```
FamiliasPalmete/
├── db/
│   ├── connection.js
│   ├── init.sql
│   └── setup.js
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── sections/
│   │   └── ui/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── el-problema/
│   │   ├── la-solucion/
│   │   ├── mapa/
│   │   ├── privacidad/
│   │   ├── admin/
│   │   └── api/
│   └── styles/
├── docker-compose.yml
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── .env
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Construye para producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm run astro` | CLI de Astro |

## Despliegue

```bash
npm run build
node ./dist/server/entry.mjs
```

## Seguridad y anti-spam

### Fingerprint del navegador

Cada usuario genera un identificador único basado en características de su dispositivo:

- User agent
- Resolución de pantalla
- Idioma del sistema
- Zona horaria
- Núcleos del procesador
- Memoria RAM
- Profundidad de color

### Límite: 1 envío por usuario

El servidor comprueba si el fingerprint ya existe antes de aceptar un nuevo reporte.

### Validación de campos

El servidor rechaza envíos incompletos (`400`) si faltan campos obligatorios.

## Cómo contribuir

### Clonar el repositorio

**HTTPS:**
```bash
git clone https://github.com/<usuario>/FamiliasPalmete.git
```

**SSH (recomendado):**
```bash
git clone git@github.com:<usuario>/FamiliasPalmete.git
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
   npm run dev
   ```
3. Commit:
   ```bash
   git add .
   git commit -m "feat: añadir sección de testimonios"
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
