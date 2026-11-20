
import {
  Controller,
  Get,
  Patch,
  Param,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR, Role.WORKER)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // Получение уведомлений пользователя
  @Get()
  findAll(@Request() req: any) {
    return this.notificationsService.findAll(
      Number(req.user.sub),
    );
  }

  // Количество непрочитанных уведомлений
  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(
      Number(req.user.sub),
    );
  }

  // Отметка уведомления как прочитанного
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.notificationsService.markAsRead(
      id,
      Number(req.user.sub),
    );
  }
}
