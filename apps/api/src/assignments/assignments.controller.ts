import { Controller, Post, Get, Body } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * Ruta para que el profesor cree una tarea con sus casos de prueba
   * POST http://localhost:3000/assignments o http://localhost:3001/assignments
   */
  @Post()
  async create(
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    return await this.assignmentsService.create(createAssignmentDto);
  }

  /**
   * Ruta para listar todas las tareas
   * GET http://localhost:3000/assignments o http://localhost:3001/assignments
   */
  @Get()
  async findAll(): Promise<Assignment[]> {
    return await this.assignmentsService.findAll();
  }
}
