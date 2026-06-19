import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { getRepositoryToken } from '@nestjs/typeorm'; // <-- 1. IMPORTANTE: Necesitamos esto para que Nest no falle
import { Assignment } from './entities/assignment.entity'; // <-- Asegúrate de tener tu entidad importada aquí

interface MockAssignment {
  fechaPublicacion: Date;
  fechaEntrega: Date;
}

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        // <-- 2. REQUISITO OBLIGATORIO: El mock que evita el error del pipeline de Git
        {
          provide: getRepositoryToken(Assignment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  describe('Validación de Casos de Prueba', () => {
    it('debería lanzar un error si hay un .in pero no hay un .out', () => {
      const input = '5 4';
      const output = '';

      expect(() => service.validateTestCase(input, output)).toThrow();
    });

    it('debería pasar la validación si hay un .out válido', () => {
      expect(() => service.validateTestCase('5 4', '9')).not.toThrow();
    });
  });

  describe('Reglas de Fechas (Visibilidad)', () => {
    it('no debería ser visible si la fecha actual es ANTES de la fecha de publicación', () => {
      // 3. CAMBIO DE FECHAS: Usamos el año 2030 para evitar conflictos con el año actual
      const assignment: MockAssignment = {
        fechaPublicacion: new Date('2030-06-15T00:00:00Z'),
        fechaEntrega: new Date('2030-06-20T00:00:00Z'),
      };
      const currentDate = new Date('2030-06-10T00:00:00Z');

      const isVisible = service.canStudentView(assignment as any, currentDate);
      expect(isVisible).toBe(false);
    });

    it('debería ser visible si la fecha actual es DESPUÉS de la fecha de publicación', () => {
      const assignment: MockAssignment = {
        fechaPublicacion: new Date('2030-06-15T00:00:00Z'),
        fechaEntrega: new Date('2030-06-20T00:00:00Z'),
      };
      const currentDate = new Date('2030-06-16T00:00:00Z');

      const isVisible = service.canStudentView(assignment as any, currentDate);
      expect(isVisible).toBe(true);
    });
  });
});