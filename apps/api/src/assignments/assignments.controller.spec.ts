import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { BadRequestException } from '@nestjs/common';

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentsService],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  describe('Validación de Casos de Prueba', () => {
    it('debería lanzar error si hay un .in pero no hay un .out', () => {
      // Regla: No puede haber in sin out
      const testCaseDto = {
        input: '5 4', // Simulamos el 0.in
        output: '', // Simulamos que olvidaron el 0.out
      };

      expect(() =>
        service.validateTestCase(testCaseDto.input, testCaseDto.output),
      ).toThrow(BadRequestException);
    });

    it('debería pasar la validación si hay un .out válido', () => {
      expect(() => service.validateTestCase('5 4', '9')).not.toThrow();
    });
  });

  describe('Reglas de Fechas (Visibilidad)', () => {
    it('no debería ser visible si la fecha actual es ANTES de la fecha de publicación', () => {
      const assignment = new Assignment();
      assignment.fechaPublicacion = new Date('2026-06-15T00:00:00Z');
      const currentDate = new Date('2026-06-10T00:00:00Z');

      const isVisible = service.canStudentView(assignment, currentDate);
      expect(isVisible).toBe(false);
    });

    it('debería ser visible si la fecha actual es DESPUÉS de la fecha de publicación', () => {
      const assignment = new Assignment();
      assignment.fechaPublicacion = new Date('2026-06-15T00:00:00Z');
      const currentDate = new Date('2026-06-16T00:00:00Z');

      const isVisible = service.canStudentView(assignment, currentDate);
      expect(isVisible).toBe(true);
    });
  });
});
