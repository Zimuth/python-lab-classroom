import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { Assignment, TestCase } from './assignments/entities/assignment.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      // Cambiamos el puerto por defecto al 5555 que es el que usa tu archivo docker-compose
      port: parseInt(process.env.DB_PORT || '5555', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'python_lab',
      entities: [User, Assignment, TestCase], // <-- Registramos explícitamente las entidades para asegurar la sincronización
      autoLoadEntities: true,
      synchronize: true, // Crea automáticamente las tablas en PostgreSQL al levantar el servidor
    }),

    UsersModule,

    AssignmentsModule, // <-- Tu módulo de tareas ya está correctamente registrado aquí
  ],
})
export class AppModule {}
