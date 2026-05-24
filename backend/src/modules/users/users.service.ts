import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // Atualiza o hashedRefreshToken
  async updateRefreshToken(id, hashedRefreshToken: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: id },
      { $set: { hashedRefreshToken } },
    );
  }

  // Cria um novo usuário
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  // Busca todos os usuários
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Busca um usuário por ID
  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('name createdAt hashedRefreshToken')
      .exec();
  }

  // Busca um usuário pelo email
  async findByEmail(email: string)
  // : Promise<User | null> 
  {
    return this.userModel.findOne({ email }).exec();
  }

  // Atualiza um usuário
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  // Deleta um usuário
  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }
}
