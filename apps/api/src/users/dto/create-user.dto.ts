import { IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El ID es obligatorio' })
  @IsString()
  id: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  apellido: string;

  @IsEmail({}, { message: 'El formato del correo electrónico es inválido' })
  @IsNotEmpty()
  email: string;

  @IsIn(['Profesor', 'Estudiante'], { message: 'El rol debe ser Profesor o Estudiante' })
  @IsNotEmpty()
  rol: string;
}