
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NormCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async checkValue(
    checklistValueId: number,
    equipmentId: number,
    parameter: string,
    value: number,
  ) {
    const norms = await this.prisma.normRange.findMany({
      where: { equipmentId },
    });

    const norm = norms.find(
      (item) =>
        item.parameter.toLocaleLowerCase('ru-RU') ===
        parameter.toLocaleLowerCase('ru-RU'),
    );

    if (!norm) {
      return {
        checklistValueId,
        parameter,
        value,
        unit: null,
        status: 'NORMAL' as const,
        message: 'Норматив не найден',
        min: null,
        max: null,
        warnMin: null,
        warnMax: null,
      };
    }

    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    let message = 'Показатель в норме';

    if (
      (norm.min !== null && value < norm.min) ||
      (norm.max !== null && value > norm.max)
    ) {
      status = 'CRITICAL';
      message = 'Критическое отклонение от нормы';
    } else if (
      (norm.warnMin !== null && value < norm.warnMin) ||
      (norm.warnMax !== null && value > norm.warnMax)
    ) {
      status = 'WARNING';
      message = 'Показатель вышел за предупредительный диапазон';
    }

    return {
      checklistValueId,
      parameter,
      value,
      unit: norm.unit,
      status,
      message,
      min: norm.min,
      max: norm.max,
      warnMin: norm.warnMin,
      warnMax: norm.warnMax,
    };
  }
}
