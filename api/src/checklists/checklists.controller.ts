
import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ChecklistsService } from './checklists.service.js';
import { CreateChecklistDto } from './dto/create-checklist.dto.js';
import { CreateChecklistValueDto } from './dto/create-checklist-value.dto.js';

import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  Role.ADMIN,
  Role.MANAGER,
  Role.OPERATOR,
  Role.WORKER,
)
export class ChecklistsController {
  constructor(
    private readonly checklistsService: ChecklistsService,
  ) {}

  // Получение всех чек-листов
  @Get()
  findAll() {
    return this.checklistsService.findAll();
  }

  // Получение одного чек-листа
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.checklistsService.findOne(id);
  }

  // Создание нового чек-листа
  @Post()
  create(@Body() dto: CreateChecklistDto, @Request() req: any) {
    return this.checklistsService.create(
      dto,
      Number(req.user.sub),
    );
  }

  // Добавление значений в чек-лист
  @Post(':id/values')
  addValues(
    @Param('id', ParseIntPipe) id: number,
    @Body('values') values: CreateChecklistValueDto[],
  ) {
    return this.checklistsService.addValues(id, values);
  }

  // Проверка нормативов
  @Get(':id/norm-check')
  checkNorms(@Param('id', ParseIntPipe) id: number) {
    return this.checklistsService.checkNorms(id);
  }
}
