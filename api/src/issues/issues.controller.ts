
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { IssuesService } from './issues.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { Role, IssueStatus } from '@prisma/client';

@Controller('issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  // Получение списка тикетов
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR, Role.WORKER)
  findAll(@Request() req: any) {
    return this.issuesService.findAll(
      Number(req.user.sub),
      req.user.role,
    );
  }

  // Получение одного тикета
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR, Role.WORKER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.findOne(id);
  }

  // Назначение тикета оператору
  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body('operatorId') operatorId: number,
  ) {
    return this.issuesService.assign(id, Number(operatorId));
  }

  // Изменение статуса тикета
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: IssueStatus,
    @Body('resolution') resolution?: string,
  ) {
    return this.issuesService.updateStatus(
      id,
      status,
      resolution,
    );
  }
}
