
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Получение уведомлений пользователя
  async findAll(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Подсчёт непрочитанных уведомлений
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  // Отметка уведомления как прочитанного
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Нет доступа к этому уведомлению',
      );
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });
  }
}
