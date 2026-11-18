
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.equipment.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.equipment.findUnique({
      where: { id },
    });
  }
}
