import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activación global de las tuberías de validación (Validation Pipes)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remueve propiedades del Body que no estén declaradas en el DTO
    forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no permitidas
    transform: true, // Transforma automáticamente los tipos de datos de los payloads
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();