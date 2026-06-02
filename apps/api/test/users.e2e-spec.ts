import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users debe rechazar datos inválidos', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: '',
        email: 'abc',
        password: '22',
      })
      .expect(400);
  });
  it('POST /users debe crear un usuario válido', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Juan Pérez',
        email: `juan${Date.now()}@test.com`,
        password: '123465',
      })
      .expect(201);
  });
  it('GET /users debe devolver una lista', () => {
    return request(app.getHttpServer()).get('/users').expect(200);
  });
});
