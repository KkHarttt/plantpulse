
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('equipment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
  ) {}

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.findOne(id);
  }
}
