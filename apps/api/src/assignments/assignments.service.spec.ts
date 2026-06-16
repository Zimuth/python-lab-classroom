import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';

// Definimos una interfaz local simulada para la prueba, evitando usar la entidad directa si causa conflictos de tipos
interface MockAssignment {
  fechaPublicacion: Date;
  fechaEntrega: Date;
}

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentsService],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  describe('Validación de Casos de Prueba', () => {
    it('debería lanzar un error si hay un .in pero no hay un .out', () => {
      const input = '5 4'; // Simulamos el 0.in
      const output = ''; // Simulamos que olvidaron el 0.out

      // Verificamos que la función lance CUALQUIER excepción/error cuando rompe la regla
      expect(() => service.validateTestCase(input, output)).toThrow();
    });

    it('debería pasar la validación si hay un .out válido', () => {
      expect(() => service.validateTestCase('5 4', '9')).not.toThrow();
    });
  });

  describe('Reglas de Fechas (Visibilidad)', () => {
    it('no debería ser visible si la fecha actual es ANTES de la fecha de publicación', () => {
      const assignment: MockAssignment = {
        fechaPublicacion: new Date('2026-06-15T00:00:00Z'),
        fechaEntrega: new Date('2026-06-20T00:00:00Z'),
      };
      const currentDate = new Date('2026-06-10T00:00:00Z');

      const isVisible = service.canStudentView(assignment as any, currentDate);
      expect(isVisible).toBe(false);
    });

    it('debería ser visible si la fecha actual es DESPUÉS de la fecha de publicación', () => {
      const assignment: MockAssignment = {
        fechaPublicacion: new Date('2026-06-15T00:00:00Z'),
        fechaEntrega: new Date('2026-06-20T00:00:00Z'),
      };
      const currentDate = new Date('2026-06-16T00:00:00Z');

      const isVisible = service.canStudentView(assignment as any, currentDate);
      expect(isVisible).toBe(true);
    });
  });
});
