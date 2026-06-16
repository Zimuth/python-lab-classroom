import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTestCaseDto {
  @IsString()
  @IsOptional()
  input!: string;

  @IsString()
  @IsNotEmpty()
  output!: string;
}

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaPublicacion!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaEntrega!: string;

  @IsString()
  @IsOptional()
  solucionProfesor!: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true }) // <-- Corregido aquí
  @Type(() => CreateTestCaseDto)
  testCases!: CreateTestCaseDto[];
}
