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

## Ejecutar Sandbox

# Requisitos

- Docker
- NodeJS

# Pasos

1. Instalar dependencias sandbox-service

```bash
cd apps/sandbox-service
npm install
```

2. Ejecutar sandbox-service

```bash
npm run start:dev
```

3. Iniciar redis en docker

```bash
docker run -d --name redis -p 6379:6379 redis:8
```

4. Iniciar el sandbox docker

```bash
cd apps/sandbox-service
docker build -t sb-python .
docker run -p 8500:8500 sb-python
```

# Testing

Para probar el sandbox usaremos Bruno o Postman, el tipo de conexión es WebSocket no HTTP entonces seleccionamos WS y nos conectamos al siguiente endpoint:

```
ws://localhost:3000/sandbox/execute
```

Y en Message escribimos el código dentro del JSON.

```json
{
  "event": "execute",
  "data": {
    "code": "import time\nfor i in range(5):\n    print(f'Hello2 {i}')\n    time.sleep(1.5)"
  }
}
```

# Comandos útiles para troubleshooting

```bash
docker ps
```

Este comando es para verificar que ambos contenedores estén corriendo. Veremos sb-python y redis.

```bash
docker exec -it <id> sh
```

Este comando es para entrar en forma iteractiva al contendenero y ver el contendido, (/apps/executions).

```bash
while true; do clear; ls -la executions/; sleep 0.5; done
```

Este comando es para ver los archivos que se generan en el contenedor en tiempo real.
