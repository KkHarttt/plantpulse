
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateChecklistValueDto } from './dto/create-checklist-value.dto.js';
import { NormCheckService } from './norm-check.service.js';

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
    }

    return {
      checklistId,
      checkedCount: results.length,
      results,
    };
  }
}
