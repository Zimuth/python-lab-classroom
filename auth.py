import os

def generar_registro():
    print("--- Generador de Miembros del Classroom ---")

    nombre = input("Introduce el Nombre: ")
    apellido = input("Introduce el Apellido: ")
    email = input("Introduce el Email: ")
    
    print("Roles disponibles: 1. Profesor | 2. Estudiante")
    opcion = input("Selecciona el rol (1 o 2): ")
    rol = "Profesor" if opcion == "1" else "Estudiante"

    user_id = email.replace("@", "_").replace(".", "_")
    
    user_folder = os.path.join("tasks", user_id)
    
    if not os.path.exists(user_folder):
        os.makedirs(user_folder)
    
    generated_file_path = os.path.join(user_folder, f"{user_id}.py")
    
    contenido_py = f"""# Archivo generado para: {nombre} {apellido}
user_info = {{
    "id": "{user_id}",
    "nombre": "{nombre}",
    "apellido": "{apellido}",
    "email": "{email}",
    "rol": "{rol}",
    "status": "pending"
}}
"""

    with open(generated_file_path, "w", encoding="utf-8") as f:
        f.write(contenido_py)

    print("-" * 30)
    print(f"¡Éxito! Se ha generado el registro para el {rol}.")
    print(f"Ubicación: {generated_file_path}")

if __name__ == "__main__":
    generar_registro()