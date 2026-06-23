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

| Tecnología     | Uso                  |
| -------------- | -------------------- |
| Node.js        | Entorno de ejecución |
| Next.js        | Frontend             |
| React          | Interfaz de usuario  |
| NestJS         | Backend API          |
| PostgreSQL     | Base de datos        |
| Docker         | Contenedores         |
| GitHub Actions | Integración continua |
| ESLint         | Calidad de código    |
| Prettier       | Formato de código    |
| Husky          | Git hooks            |

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
docker build -t my-python-sandbox:latest ./apps/sb-python
```

**Importante según el Sistema Operativo**

- **Linux (k3s):** k3s usa su propio motor `containerd`, por lo que no ve las imágenes de Docker local. Se debe exportarla e importarla:
  ```bash
  docker save my-python-sandbox:latest -o my-python-sandbox.tar
  sudo k3s ctr images import my-python-sandbox.tar
  ```
- **Windows / Mac (Docker Desktop):** Kubernetes en Docker Desktop comparte las imágenes de Docker automáticamente. No se necesita hacer nada más
- **Windows / Mac (Minikube):** Se carga la imagen ejecutando `minikube image load my-python-sandbox:latest`.

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

## Elegir proveedor de VPS

Puede ser DigitalOcean, AWS, Google Cloud o cualquier proveedor que proporcione un VPS con una IPv4 pública. Se usará Amazon Lightsail para este README con la distribución Ubuntu 24.04.4 LTS x86_64, pero se puede usar cualquier distribución, sin embargo en este README estará orientado a distribuciones basadas en Debian ya que usaremos apt como manejador de paquetes.
Al descargar la clave SSH por defecto del VPS en AmazonLightsail ejecutamos:
`ssh -i LightsailDefaultKey-sa-east-1.pem ubuntu@<IP>`
después en la línea de la terminal se mostrará `ubuntu@ip-<IP>:~$` hecho esto se puede continuar.

## Instalar Docker

apt docker.io

## Instalar Redis

mediante docker compose

## Instalar Kubernetes

## Crear un nuevo usuario para los microservicios

sudo useradd -m -s /bin/bash apps_user
sudo passwd apps_user

Se pedirá introducir una contraseña, en este caso se pondrá: NestNext!1

## Instalar NVM (Node Version Manager) y NodeJS

Actualmente está logeado en user ubuntu pero se debe cambiar al usuario que acabamos de crear con el comando:
su - apps_user
Pedirá la contraseña, se entrará con NestNext!1

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash

Probamos si está correcto saliendo con
exit
y luego volviendo a hacer
su - apps_user
nvm --version
Ahora ya podemos utilizar nvm para instalar node
nvm install 24
y verificamos con
node --version
(recordar que seguimos como el usuario apps_user)

## Instalar PM2

Ahora ya podemos instalar PM2 con npm ya que al tener node también tenemos el manejador de paquetes de NodeJs que es npm, ejecutamos
npm -g install pm2

## Clonar repositorio y ejecutar sandbox-service con pm2

Primero vamos a /opt con
cd /opt
cambiamos a el usuario ubuntu
exit
sudo mkdir -p /opt/python-lab-classroom
sudo chown -R apps_user:apps_user /opt/python-lab-classroom

# cambiamos a apps_user otra vez

su - apps_user
git clone https://github.com/Zimuth/python-lab-classroom.git /opt/python-lab-classroom
cd /opt/python-lab-classroom
git switch develop (Este paso solo lo hacemos si todavía está en desarrollo sino podemos quedarnos en la rama main)
cd apps/sandbox-service
npm install
npm run build
pm2 start /opt/python-lab-classroom/apps/sandbox-service/dist/main.js --name service-sandbox
