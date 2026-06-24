# Python Lab Classroom

Plataforma educativa tipo classroom orientada al aprendizaje interactivo de Python mediante laboratorios virtuales, resolución de ejercicios y evaluación automatizada.

## Descripción del Proyecto

Python Lab Classroom es una plataforma web desarrollada y pensada para la materia de Generación de Software. El sistema permitirá a docentes crear clases virtuales, ejercicios prácticos y laboratorios interactivos de programación en Python.

Los estudiantes podrán resolver ejercicios directamente desde la plataforma mediante un entorno integrado de ejecución de código Python.

---

## Objetivos

- Crear aulas virtuales para enseñanza de Python
- Permitir resolución de ejercicios en línea
- Ejecutar código Python en entornos seguros
- Implementar evaluación automática
- Gestionar progreso de estudiantes
- Incorporar diagramas y recursos visuales
- Aplicar prácticas modernas de desarrollo de software

---

## Arquitectura General

El proyecto utilizará arquitectura modular basada en monorepo.

### Componentes principales

- Frontend Web
- Backend API
- Servicio de ejecución Python
- Base de datos PostgreSQL
- Infraestructura Docker
- Integración Continua (CI/CD)

---

## Tecnologías Utilizadas

| Tecnología     | Uso                         |
| -------------- | --------------------------- |
| Node.js        | Entorno de ejecución        |
| React          | Interfaz de usuario         |
| NestJS         | Backend API                 |
| PostgreSQL     | Base de datos               |
| Docker         | Contenedores                |
| k3s            | Orquestador de contenedores |
| GitHub Actions | Integración continua        |
| ESLint         | Calidad de código           |
| Prettier       | Formato de código           |
| Husky          | Git hooks                   |

---

## Infraestructura DevOps

El proyecto cuenta con integración continua mediante GitHub Actions.

### Funcionalidades configuradas

- Pipeline automático CI/CD
- Validación de dependencias
- Hooks de Git con Husky
- Formateo automático con Prettier
- Estructura profesional de proyecto
- Configuración inicial para ESLint

---

## Estructura Inicial

```txt
python-lab-classroom/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .husky/
│   └── pre-commit
│
├── apps/
├── packages/
│
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Configuración del Proyecto

### Clonar repositorio

```bash
git clone https://github.com/Zimuth/python-lab-classroom.git
```

### Instalar dependencias

```bash
npm install
```

---

## 🔄 Integración Continua

El pipeline CI/CD se ejecuta automáticamente mediante GitHub Actions en cada:

- push
- pull request

---

## Estado del Proyecto

🚧 En desarrollo

Actualmente se encuentra en fase de preparación de infraestructura y configuración base del entorno de desarrollo.

---

## Licencia

Proyecto académico desarrollado para la materia de Generación de Software.

## Arquitectura Auto-escalable del Sandbox (k3s + KEDA)

### ¿Qué se hizo?

Se migró la ejecución del sandbox de un simple contenedor Docker a una arquitectura orquestada y auto-escalable utilizando **Kubernetes (k3s)** y **KEDA (Kubernetes Event-driven Autoscaling)**.

### ¿Cómo funciona?

1. **NestJS** recibe las solicitudes de ejecución de código mediante WebSockets y las encola en **BullMQ** (respaldado por **Redis**).
2. **KEDA**, que vive dentro del clúster de Kubernetes, monitorea constantemente la longitud de esta cola de espera en Redis.
3. Si la cola crece (ej. muchos estudiantes enviando código a la vez), KEDA instruye a Kubernetes para que multiplique (escale) los contenedores (Pods) del sandbox de Python automáticamente (escalando 1 pod extra por cada 15 solicitudes encoladas).
4. El servicio de NestJS se conecta al balanceador de carga de Kubernetes, el cual distribuye las conexiones WebSocket entrantes de manera uniforme entre todos los pods de Python disponibles.
5. Cuando la carga de trabajo disminuye y la cola se vacía, Kubernetes espera 60 segundos (Ventana de Estabilización) y luego destruye los pods adicionales, regresando a un solo pod para ahorrar recursos.

---

## Cómo ejecutar esta arquitectura en tu máquina

### Requisitos Previos

- **Node.js** (v18+)
- **Redis** corriendo localmente o en Docker (mejor Docker porque si el local hay que configurar para que escuche en 0.0.0.0)
- **Kubernetes Local**:
  - **Linux:** Instalar [k3s](https://k3s.io/) (`curl -sfL https://get.k3s.io | sh -`)
  - **Windows / Mac:** Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/) y habilitar la opción de Kubernetes en los ajustes, o utilizar [Minikube](https://minikube.sigs.k8s.io/) o [Rancher Desktop](https://rancherdesktop.io/).

### Pasos de Instalación

#### 1. Iniciar Redis

Si no se tiene Redis, se puede iniciar en Docker expuesto a la red local (necesario para que Kubernetes lo pueda alcanzar):

```bash
docker run -d --name redis -p 6379:6379 redis:8
```

_(Nota: Si se instala Redis nativo, se debe asegurar que acepte conexiones externas configurando `bind 0.0.0.0` en el archivo `redis.conf`)._

#### 2. Instalar KEDA en tu clúster de Kubernetes

Se debe instalar el auto-escalador KEDA en el clúster. Se ejecuta este comando en la terminal:

```bash
kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.14.0/keda-2.14.0.yaml
```

#### 3. Construir e Importar la Imagen Docker del Sandbox

Se construye la imagen de Python ubicándose en la raíz del proyecto:

```bash
docker build -t python-sandbox:latest ./apps/sb-python
```

**Importante según el Sistema Operativo**

- **Linux (k3s):** k3s usa su propio motor `containerd`, por lo que no ve las imágenes de Docker local. Se debe exportarla e importarla:
  ```bash
  docker save python-sandbox:latest -o python-sandbox.tar
  sudo k3s ctr images import python-sandbox.tar
  ```
- **Windows / Mac (Docker Desktop):** Kubernetes en Docker Desktop comparte las imágenes de Docker automáticamente. No se necesita hacer nada más
- **Windows / Mac (Minikube):** Se carga la imagen ejecutando `minikube image load python-sandbox:latest`.

#### 4. Configurar tu IP Local

Abre el archivo `k8s/python-sandbox.yaml`. En la sección inferior (configuración de KEDA), se debe reemplazar la dirección IP de Redis con **la IP de la máquina en la red local (LAN)** (por ejemplo, `192.168.1.50:6379`). **No usar localhost o 127.0.0.1** ya que KEDA está dentro del clúster y no podrá alcanzar el host.

```yaml
- type: redis
  metadata:
    address: IP_LOCAL:6379
    listName: bull:python-execution:wait
```

#### 5. Desplegar en Kubernetes

Se aplican los manifiestos para crear el Deployment, el Servicio LoadBalancer y el Autoescalador:

```bash
kubectl apply -f k8s/python-sandbox.yaml
```

Se verifica que el pod está corriendo exitosamente:

```bash
kubectl get pods -l app=python-sandbox
```

#### 6. Iniciar NestJS

Se instalan las dependencias y se corre el backend:

```bash
cd apps/sandbox-service
npm install
npm run start:dev
```

_(Nota: El backend se conectará automáticamente al balanceador de carga de Kubernetes en `ws://localhost:8500/ws/execute`)._

---

# Comandos útiles para Troubleshooting en Kubernetes

**Ver los contenedores (Pods) corriendo:**

```bash
kubectl get pods
```

**Ver los logs del sandbox en tiempo real:**

```bash
kubectl logs -l app=python-sandbox -f
```

**Entrar de forma interactiva a un sandbox (terminal):**

```bash
kubectl exec -it <nombre-del-pod> -- /bin/bash
```

**Ver el estado del auto-escalador (útil si no está escalando correctamente o no encuentra Redis):**

```bash
kubectl describe scaledobject python-sandbox-scaler
```

# Cómo hacer el deploy paso por paso desde cero

## 1. Elegir proveedor de VPS

Puede ser DigitalOcean, AWS, Google Cloud o cualquier proveedor que proporcione un VPS con una IPv4 pública. Se usará **Amazon Lightsail** para este README con la distribución **Ubuntu 24.04.4 LTS x86_64**, pero se puede usar cualquier distribución basada en Debian (usaremos `apt` como manejador de paquetes).

Al descargar la clave SSH por defecto del VPS en Amazon Lightsail, nos conectamos:

```bash
ssh -i LightsailDefaultKey-sa-east-1.pem ubuntu@<IP>
```

Una vez conectado, la terminal mostrará `ubuntu@ip-<IP>:~$` y se puede continuar.

### 1.1. Configurar dominio y subdominios (DNS)

Este proyecto utiliza **3 subdominios** que deben apuntar a la IP pública de tu VPS. Ir al panel de administración DNS de tu proveedor de dominio (ej: Namecheap, Cloudflare, GoDaddy, Route 53) y crear los siguientes registros **A**:

| Tipo | Nombre (Host)   | Valor (IP)        | Descripción                      |
|------|-----------------|-------------------|----------------------------------|
| A    | `python-lab`    | `<IP_PUBLICA_VPS>` | Frontend (React)                |
| A    | `api.python-lab` | `<IP_PUBLICA_VPS>` | API REST (NestJS)               |
| A    | `sandbox.python-lab` | `<IP_PUBLICA_VPS>` | Sandbox WebSocket (sandbox-service) |

> **Nota:** El nombre exacto depende de tu dominio base. Si tu dominio es `pipexapp.com`, los subdominios completos serían `python-lab.pipexapp.com`, `api.python-lab.pipexapp.com` y `sandbox.python-lab.pipexapp.com`.

> **Tip:** Los cambios de DNS pueden tardar entre unos minutos y hasta 48 horas en propagarse. Se puede verificar con `nslookup python-lab.pipexapp.com` o `dig python-lab.pipexapp.com`.

También se deben abrir los siguientes puertos en el firewall del VPS (en AWS Lightsail, ir a la pestaña **Networking** de la instancia):

| Puerto | Protocolo | Uso                    |
|--------|-----------|------------------------|
| 22     | TCP       | SSH                    |
| 80     | TCP       | HTTP (Nginx)           |
| 443    | TCP       | HTTPS (Nginx + SSL)    |

---

## 2. Instalar Docker

> **Contexto:** Ejecutar como usuario `ubuntu`.

Agregar la clave GPG oficial de Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Agregar el repositorio a las fuentes de apt:

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Instalar Docker Engine y Docker Compose:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 3. Iniciar Redis con Docker Compose

Desde la raíz del repositorio clonado, iniciar el servicio de Redis definido en `docker-compose.yml`:

```bash
docker compose up -d
```

Verificar que Redis está corriendo:

```bash
docker ps
```

---

## 4. Construir la imagen Docker del Sandbox

Desde la raíz del proyecto, construir la imagen:

```bash
docker build -t python-sandbox:latest ./apps/sb-python
```

---

## 5. Instalar Kubernetes (k3s)

> **⚠️ IMPORTANTE:** Se debe deshabilitar Traefik **antes** de instalar k3s (o inmediatamente después y reiniciar). Traefik ocupa los puertos 80 y 443, lo cual impedirá que Nginx funcione más adelante.

### 5.1. Crear el archivo de configuración de k3s

```bash
sudo mkdir -p /etc/rancher/k3s
sudo nano /etc/rancher/k3s/config.yaml
```

Pegar el siguiente contenido:

```yaml
disable:
  - traefik
```

Guardar y salir (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 5.2. Instalar k3s

```bash
curl -sfL https://get.k3s.io | sh -
```

Verificar que k3s está corriendo:

```bash
sudo systemctl status k3s
kubectl get nodes
```

### 5.3. Instalar KEDA (Autoescalador)

KEDA es el autoescalador que monitorea la cola de Redis y escala los pods del sandbox automáticamente:

```bash
kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.14.0/keda-2.14.0.yaml
```

Verificar que KEDA está corriendo:

```bash
kubectl get pods -n keda
```

### 5.4. Importar la imagen del Sandbox a k3s

k3s usa su propio motor `containerd`, por lo que **no ve las imágenes de Docker local**. Se debe exportar la imagen e importarla manualmente:

```bash
docker save python-sandbox:latest -o python-sandbox.tar
sudo k3s ctr images import python-sandbox.tar
```

Verificar que la imagen fue importada:

```bash
sudo k3s ctr images list | grep python-sandbox
```

### 5.5. Configurar la IP de Redis en el manifiesto de Kubernetes

KEDA necesita conectarse a Redis para monitorear la cola de trabajos. Dado que KEDA corre dentro del clúster de Kubernetes, **no puede usar `localhost` ni `127.0.0.1`** — se debe usar la IP privada del servidor.

Obtener la IP privada:

```bash
hostname -I
```

Editar el archivo `k8s/python-sandbox.yaml` y reemplazar la dirección IP de Redis en la sección de KEDA:

```bash
nano k8s/python-sandbox.yaml
```

Buscar la sección de triggers y actualizar la IP:

```yaml
triggers:
  - type: redis
    metadata:
      address: <IP_PRIVADA>:6379
      listName: bull:python-execution:wait
      listLength: '15'
```

### 5.6. Desplegar el Sandbox en Kubernetes

Aplicar los manifiestos para crear el Deployment, el Service y el ScaledObject:

```bash
kubectl apply -f k8s/python-sandbox.yaml
```

Verificar que el pod está corriendo exitosamente:

```bash
kubectl get pods -l app=python-sandbox
```

> **Troubleshooting:** Si el pod muestra `ImagePullBackOff`, significa que la imagen no fue importada correctamente. Repetir el paso 5.4.

---

## 6. Crear un usuario para los microservicios

> **Contexto:** Ejecutar como usuario `ubuntu`.

```bash
sudo useradd -m -s /bin/bash apps_user
sudo passwd apps_user
```

Se pedirá introducir una contraseña (ej: `NestNext!1`).

---

## 7. Instalar NVM, Node.js y PM2

> **Contexto:** Cambiar al usuario `apps_user`.

```bash
su - apps_user
```

### 7.1. Instalar NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
```

Recargar la sesión para que NVM esté disponible:

```bash
exit
su - apps_user
nvm --version
```

### 7.2. Instalar Node.js

```bash
nvm install 24
node --version
```

### 7.3. Instalar PM2

```bash
npm install -g pm2
```

---

## 8. Clonar repositorio y ejecutar sandbox-service

> **Contexto:** Primero como `ubuntu` para crear el directorio, luego como `apps_user` para clonar y ejecutar.

Como `ubuntu`:

```bash
exit  # Salir de apps_user si estamos logueados
sudo mkdir -p /opt/python-lab-classroom
sudo chown -R apps_user:apps_user /opt/python-lab-classroom
```

Como `apps_user`:

```bash
su - apps_user
git clone https://github.com/Zimuth/python-lab-classroom.git /opt/python-lab-classroom
cd /opt/python-lab-classroom
git switch develop  # Solo si todavía está en desarrollo, sino quedarse en main
```

Compilar y ejecutar el sandbox-service con PM2:

```bash
cd apps/sandbox-service
npm install
npm run build
pm2 start /opt/python-lab-classroom/apps/sandbox-service/dist/main.js --name service-sandbox
```

---

## 9. Configuración y Despliegue de la API (NestJS)

### 9.1. Instalar y configurar PostgreSQL

> **Contexto:** Ejecutar como usuario `ubuntu`.

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Entrar a la consola de PostgreSQL:

```bash
sudo -u postgres psql
```

Crear la base de datos y el usuario (dentro de `psql`):

```sql
CREATE DATABASE api_db;
CREATE USER api_user WITH ENCRYPTED PASSWORD '<TU_CONTRASEÑA>';
\q
```

Conectarse a la base de datos recién creada para asignar permisos:

```bash
sudo -u postgres psql -d api_db
```

```sql
GRANT ALL PRIVILEGES ON DATABASE api_db TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;
GRANT CREATE ON SCHEMA public TO api_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO api_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO api_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO api_user;
\q
```

### 9.2. Desplegar la API

> **Contexto:** Ejecutar como usuario `apps_user`.

```bash
su - apps_user
cd /opt/python-lab-classroom
```

Cambiar a la rama correcta:

```bash
git fetch origin
git switch api-deploy
```

Instalar dependencias y configurar el entorno:

```bash
cd apps/api
npm install
nano .env
```

Contenido del archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=api_user
DB_PASSWORD=<TU_CONTRASEÑA>
DB_NAME=api_db
```

Guardar y salir (`Ctrl+O`, `Enter`, `Ctrl+X`).

Compilar y arrancar la API con PM2:

```bash
npm run build
pm2 start dist/main.js --name "nest-api"
pm2 save
pm2 startup
```

Verificar que funciona:

```bash
pm2 logs nest-api
```

---

## 10. Desplegar el Frontend

> **Contexto:** Ejecutar como usuario `apps_user`.

```bash
cd /opt/python-lab-classroom/apps/frontend
npm install
npm run build
```

Copiar los archivos compilados al directorio de Nginx (requiere `ubuntu`):

```bash
exit  # Volver a ubuntu
sudo mkdir -p /var/www/python-lab-client
sudo cp -r /opt/python-lab-classroom/apps/frontend/dist/* /var/www/python-lab-client/
sudo chown -R www-data:www-data /var/www/python-lab-client
```

---

## 11. Instalar y configurar Nginx

> **Contexto:** Ejecutar como usuario `ubuntu`.

```bash
sudo apt install -y nginx
```

### 11.1. Configurar el sitio del Frontend

```bash
sudo nano /etc/nginx/sites-available/python-lab
```

Pegar el siguiente contenido:

```nginx
server {
    listen 80 default_server;
    server_name <dominio>;

    root /var/www/python-lab-client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/python-lab /etc/nginx/sites-enabled/
```

### 11.2. Configurar el proxy reverso para la API

```bash
sudo nano /etc/nginx/sites-available/api.python-lab
```

Pegar el siguiente contenido:

```nginx
server {
    listen 80;
    server_name <api-dominio>;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/api.python-lab /etc/nginx/sites-enabled/
```

### 11.3. Configurar el proxy WebSocket para el Sandbox

El sandbox-service usa **WebSockets** para enviar la salida del código Python en tiempo real al navegador. Nginx debe estar configurado para permitir la conexión WebSocket con los headers `Upgrade` y `Connection`.

```bash
sudo nano /etc/nginx/sites-available/sandbox.python-lab
```

Pegar el siguiente contenido:

```nginx
server {
    listen 80;
    server_name sandbox.python-lab.pipexapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

> **Nota:** `proxy_read_timeout 86400` (24 horas) evita que Nginx cierre las conexiones WebSocket por inactividad. Los headers `Upgrade` y `Connection "upgrade"` son **obligatorios** para que el protocolo WebSocket funcione a través del proxy.

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/sandbox.python-lab /etc/nginx/sites-enabled/
```

### 11.4. Activar los sitios y reiniciar Nginx

Eliminar la configuración por defecto de Nginx, probar y reiniciar:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 12. Instalar Certbot (SSL/HTTPS)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

Obtener los certificados SSL para los 3 subdominios:

```bash
sudo certbot --nginx -d python-lab.pipexapp.com
sudo certbot --nginx -d api.python-lab.pipexapp.com
sudo certbot --nginx -d sandbox.python-lab.pipexapp.com
```

Certbot renovará los certificados automáticamente. Se puede verificar la renovación con:

```bash
sudo certbot renew --dry-run
```
