
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateChecklistValueDto } from './dto/create-checklist-value.dto.js';
import { NormCheckService } from './norm-check.service.js';
import { Role, Severity } from '@prisma/client';

@Injectable()
export class ChecklistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normCheckService: NormCheckService,
  ) {}

  // Получение всех чек-листов
  async findAll() {
    return this.prisma.checklist.findMany({
      include: {
        template: true,
        user: {
          select: {
            id: true,
            fullName: true,
            login: true,
            role: true,
          },
        },
        department: true,
        values: {
          include: {
            equipment: true,
            templateItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получение одного чек-листа по ID
  async findOne(id: number) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            fullName: true,
            login: true,
            role: true,
          },
        },
        department: true,
        values: {
          include: {
            equipment: true,
            templateItem: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException('Чек-лист не найден');
    }

    return checklist;
  }

  // Создание нового чек-листа
  async create(
    data: {
      templateId: number;
      departmentId: number;
      date: string;
      shift: 'MORNING' | 'DAY' | 'NIGHT';
      comment?: string;
    },
    userId: number,
  ) {
    return this.prisma.checklist.create({
      data: {
        templateId: data.templateId,
        departmentId: data.departmentId,
        userId,
        date: new Date(data.date),
        shift: data.shift,
        comment: data.comment,
        photoUrls: [],
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            fullName: true,
            login: true,
            role: true,
          },
        },
        department: true,
      },
    });
  }

  // Добавление значений в чек-лист
  async addValues(
    checklistId: number,
    values: CreateChecklistValueDto[],
  ) {
    await this.findOne(checklistId);

    return this.prisma.checklistValue.createMany({
      data: values.map((value) => ({
        checklistId,
        templateItemId: value.templateItemId,
        numberValue: value.numberValue,
        done: value.done,
        failReason: value.failReason,
      })),
    });
  }

  // Поиск оператора для назначения тикета
  private async findOperator(departmentId: number) {
    // Сначала ищем оператора своего подразделения
    let operator = await this.prisma.user.findFirst({
      where: {
        role: Role.OPERATOR,
        isActive: true,
        departmentId,
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Если такого нет, ищем общего оператора
    if (!operator) {
      operator = await this.prisma.user.findFirst({
        where: {
          role: Role.OPERATOR,
          isActive: true,
          departmentId: null,
        },
        orderBy: {
          id: 'asc',
        },
      });
    }

    return operator;
  }

  // Создание тикета и уведомления
  private async createIssue(
    checklistId: number,
    reporterId: number,
    equipmentId: number,
    operatorId: number | null,
    result: {
      checklistValueId: number;
      parameter: string;
      value: number;
      unit: string | null;
      status: 'NORMAL' | 'WARNING' | 'CRITICAL';
      message: string;
      min: number | null;
      max: number | null;
      warnMin: number | null;
      warnMax: number | null;
    },
  ) {
    // Уникальный маркер показателя для защиты от дубликатов
    const marker = `[ChecklistValue:${result.checklistValueId}]`;

    const existingIssue = await this.prisma.issue.findFirst({
      where: {
        checklistId,
        description: {
          contains: marker,
        },
      },
    });

    if (existingIssue) {
      return null;
    }

    const severity =
      result.status === 'CRITICAL'
        ? Severity.CRITICAL
        : Severity.WARNING;

    const title = `${result.status}: ${result.parameter}`;

    const description = [
      marker,
      `Показатель: ${result.parameter}`,
      `Измеренное значение: ${result.value} ${result.unit ?? ''}`,
      `Нормальный диапазон: ${result.min ?? 'не задано'} - ${result.max ?? 'не задано'}`,
      `Предупредительный диапазон: ${result.warnMin ?? 'не задано'} - ${result.warnMax ?? 'не задано'}`,
      `Причина: ${result.message}`,
    ].join('\n');

    // Создаём тикет и уведомление в одной транзакции
    return this.prisma.$transaction(async (tx) => {
      const issue = await tx.issue.create({
        data: {
          checklistId,
          equipmentId,
          reporterId,
          operatorId,
          title,
          description,
          severity,
        },
      });

      // Если оператор найден, отправляем ему уведомление
      if (operatorId !== null) {
        await tx.notification.create({
          data: {
            userId: operatorId,
            issueId: issue.id,
            text: `Новый тикет ${issue.id}: ${title}. Обнаружено отклонение от норматива.`,
          },
        });
      }

      return issue;
    });
  }

  // Автоматическая проверка числовых показателей
  async checkNorms(checklistId: number) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
      include: {
        values: {
          include: {
            templateItem: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException('Чек-лист не найден');
    }

    const results = [];
    const createdIssues = [];

    let operator: { id: number } | null = null;

    for (const item of checklist.values) {
      if (
        item.numberValue === null ||
        item.templateItem.equipmentId === null
      ) {
        continue;
      }

      const result = await this.normCheckService.checkValue(
        item.id,
        item.templateItem.equipmentId,
        item.templateItem.label.split(':').pop()?.trim() ?? '',
        item.numberValue,
      );

      results.push(result);

      // Тикеты создаются только при отклонениях
      if (
        result.status !== 'WARNING' &&
        result.status !== 'CRITICAL'
      ) {
        continue;
      }

      // Ищем оператора только при первом отклонении
      if (operator === null) {
        operator = await this.findOperator(checklist.departmentId);
      }

      const issue = await this.createIssue(
        checklistId,
        checklist.userId,
        item.templateItem.equipmentId,
        operator?.id ?? null,
        result,
      );

      if (issue) {
        createdIssues.push(issue);
      }
    }

    return {
      checklistId,
      checkedCount: results.length,
      createdIssuesCount: createdIssues.length,
      createdIssues,
      notificationsCreated: operator
        ? createdIssues.length
        : 0,
      results,
    };
  }
}
