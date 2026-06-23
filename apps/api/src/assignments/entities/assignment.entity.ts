import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'timestamp' })
  fechaPublicacion!: Date;

  @Column({ type: 'timestamp' })
  fechaEntrega!: Date;

  @Column({ type: 'text', nullable: true })
  solucionProfesor!: string;

  // Una tarea tiene MUCHOS casos de prueba
  // Nota: Usamos () => TestCase para que TypeORM busque la clase abajo sin problemas
  @OneToMany(() => TestCase, (testCase) => testCase.assignment, {
    cascade: true,
  })
  testCases!: TestCase[];
}

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: true })
  input!: string;

  @Column({ type: 'text' })
  output!: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.testCases)
  assignment!: Assignment;
}
