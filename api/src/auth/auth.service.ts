
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    login: string;
    password: string;
    fullName: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: data.login },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь уже существует');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        login: data.login,
        passwordHash,
        fullName: data.fullName,
        role: Role.WORKER,
      },
    });

    return {
      id: user.id,
      login: user.login,
      fullName: user.fullName,
      role: user.role,
    };
  }

  async login(login: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const payload = {
      sub: user.id,
      login: user.login,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
