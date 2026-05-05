# Python Lab Classroom

Plataforma educativa tipo classroom orientada al aprendizaje interactivo de Python mediante laboratorios virtuales, resolución de ejercicios y evaluación automatizada.

## Descripción del Proyecto

Python Lab Classroom es una plataforma web desarrollada y pensada para la materia de Generación de Software. El sistema permitirá a docentes crear clases virtuales, ejercicios prácticos y laboratorios interactivos de programación en Python.

Los estudiantes podrán resolver ejercicios directamente desde la plataforma mediante un entorno integrado de ejecución de código Python.

---

## Objetivos

* Crear aulas virtuales para enseñanza de Python
* Permitir resolución de ejercicios en línea
* Ejecutar código Python en entornos seguros
* Implementar evaluación automática
* Gestionar progreso de estudiantes
* Incorporar diagramas y recursos visuales
* Aplicar prácticas modernas de desarrollo de software

---

## Arquitectura General

El proyecto utilizará arquitectura modular basada en monorepo.

### Componentes principales

* Frontend Web
* Backend API
* Servicio de ejecución Python
* Base de datos PostgreSQL
* Infraestructura Docker
* Integración Continua (CI/CD)

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

* Pipeline automático CI/CD
* Validación de dependencias
* Hooks de Git con Husky
* Formateo automático con Prettier
* Estructura profesional de proyecto
* Configuración inicial para ESLint

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

* push
* pull request

---

##  Estado del Proyecto

🚧 En desarrollo

Actualmente se encuentra en fase de preparación de infraestructura y configuración base del entorno de desarrollo.

---

## Licencia

Proyecto académico desarrollado para la materia de Generación de Software.
