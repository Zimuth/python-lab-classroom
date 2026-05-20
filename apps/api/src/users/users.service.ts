import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // LISTAR TODOS
  findAll() {
    return this.usersRepository.find();
  }

  // BUSCAR UN USUARIO POR ID 
  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no fue encontrado`);
    }
    return user;
  }

  // CREAR
  create(userData: Partial<User>) {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  // EDITAR / ACTUALIZAR
  async update(id: string, updateData: Partial<User>) {
    
    const user = await this.findOne(id);
    
    
    const updatedUser = this.usersRepository.merge(user, updateData);
    
  
    return this.usersRepository.save(updatedUser);
  }

  // ELIMINAR
  async remove(id: string) {
    const user = await this.findOne(id);
    
    await this.usersRepository.remove(user);
    
    return { message: `Usuario con ID ${id} eliminado con éxito` };
  }
}