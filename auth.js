const fs = require('fs');
const path = require('path');
const readline = require('readline');

function preguntar(pregunta) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(pregunta, (respuesta) => {
            rl.close();
            resolve(respuesta);
        });
    });
}

async function generarRegistro() {
    console.log("--- Generador de Miembros del Classroom ---");

    const nombre = await preguntar("Introduce el Nombre: ");
    const apellido = await preguntar("Introduce el Apellido: ");
    const email = await preguntar("Introduce el Email: ");

    console.log("Roles disponibles: 1. Profesor | 2. Estudiante");
    const opcion = await preguntar("Selecciona el rol (1 o 2): ");
    const rol = opcion === "1" ? "Profesor" : "Estudiante";

    const userId = email.replace("@", "_").replace(".", "_");

    const userFolder = path.join("tasks", userId);

    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }

    const generatedFilePath = path.join(userFolder, `${userId}.py`);

    const contenidoPy = `# Archivo generado para: ${nombre} ${apellido}
user_info = {
    "id": "${userId}",
    "nombre": "${nombre}",
    "apellido": "${apellido}",
    "email": "${email}",
    "rol": "${rol}",
    "status": "pending"
}
`;

    fs.writeFileSync(generatedFilePath, contenidoPy, 'utf-8');

    console.log("-".repeat(30));
    console.log(`¡Éxito! Se ha generado el registro para el ${rol}.`);
    console.log(`Ubicación: ${generatedFilePath}`);
}

if (require.main === module) {
    generarRegistro();
}