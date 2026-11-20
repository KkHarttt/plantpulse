
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { IssueStatus, Role } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  // Получение списка тикетов
  async findAll(userId: number, role: Role) {
    return this.prisma.issue.findMany({
      where:
        role === Role.WORKER
          ? { reporterId: userId }
          : {},
      include: {
        equipment: true,
        reporter: {
          select: {
            id: true,
            fullName: true,
            login: true,
          },
        },
        operator: {
          select: {
            id: true,
            fullName: true,
            login: true,
          },
        },
        checklist: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получение одного тикета
  async findOne(id: number) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        equipment: true,
        reporter: {
          select: {
            id: true,
            fullName: true,
            login: true,
          },
        },
        operator: {
          select: {
            id: true,
            fullName: true,
            login: true,
          },
        },
        checklist: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Тикет не найден');
    }

    return issue;
  }

  // Назначение тикета оператору
  async assign(id: number, operatorId: number) {
    await this.findOne(id);

    const operator = await this.prisma.user.findFirst({
      where: {
        id: operatorId,
        role: Role.OPERATOR,
        isActive: true,
      },
    });

    if (!operator) {
      throw new BadRequestException(
        'Активный оператор с таким ID не найден',
      );
    }

    return this.prisma.issue.update({
      where: { id },
      data: {
        operatorId,
      },
      include: {
        operator: {
          select: {
            id: true,
            fullName: true,
            login: true,
          },
        },
      },
    });
  }

  // Изменение статуса тикета
  async updateStatus(
    id: number,
    status: IssueStatus,
    resolution?: string,
  ) {
    await this.findOne(id);

    return this.prisma.issue.update({
      where: { id },
      data: {
        status,
        ...(status === IssueStatus.RESOLVED
          ? {
              resolution: resolution ?? null,
              resolvedAt: new Date(),
            }
          : {
              resolvedAt: null,
            }),
      },
    });
  }
}
