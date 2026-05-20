import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // LISTAR TODOS (GET http://localhost:3000/users)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // BUSCAR UNO SOLO (GET http://localhost:3000/users/id_del_usuario)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // CREAR CON VALIDACIÓN (POST http://localhost:3000/users)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // EDITAR (PUT http://localhost:3000/users/id_del_usuario)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  // ELIMINAR (DELETE http://localhost:3000/users/id_del_usuario)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}