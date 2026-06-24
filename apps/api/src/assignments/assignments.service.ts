import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    if (
      createAssignmentDto.testCases &&
      createAssignmentDto.testCases.length > 0
    ) {
      for (const tc of createAssignmentDto.testCases) {
        this.validateTestCase(tc.input, tc.output);
      }
    }

    const newAssignment = this.assignmentRepository.create(createAssignmentDto);
    return await this.assignmentRepository.save(newAssignment);
  }

  async findAll(): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      relations: { testCases: true }, // <-- Corregido para TypeORM moderno
    });
  }

  validateTestCase(input: string | undefined, output: string): boolean {
    if (input && input.trim() !== '' && (!output || output.trim() === '')) {
      throw new BadRequestException(
        'No puede haber un caso de prueba (.in) sin su respectiva salida (.out)',
      );
    }
    return true;
  }

  canStudentView(
    assignment: Assignment,
    currentDate: Date = new Date(),
  ): boolean {
    return currentDate >= assignment.fechaPublicacion;
  }

  isAssignmentClosed(
    assignment: Assignment,
    currentDate: Date = new Date(),
  ): boolean {
    return currentDate > assignment.fechaEntrega;
  }
}
