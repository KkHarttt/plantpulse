
import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppService } from './app.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Главная страница
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Профиль любого авторизованного пользователя
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return {
      message: 'Доступ разрешён',
      user: req.user,
    };
  }

  // Раздел администратора
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  getAdmin() {
    return {
      message: 'Доступ разрешён только администратору',
    };
  }

  // Аналитика: администратор и менеджер
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get('analytics')
  getAnalytics() {
    return {
      message: 'Доступ к аналитике разрешён',
    };
  }

  // Рабочий раздел: все авторизованные сотрудники
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.ADMIN,
    Role.MANAGER,
    Role.OPERATOR,
    Role.WORKER,
  )
  @Get('tasks')
  getTasks() {
    return {
      message: 'Доступ к рабочим задачам разрешён',
    };
  }
}
