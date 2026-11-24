
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  // Общая статистика Dashboard
  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboard();
  }

  // Тикеты по статусам
  @Get('issues/status')
  getIssuesByStatus() {
    return this.analyticsService.getIssuesByStatus();
  }

  // Тикеты по серьёзности
  @Get('issues/severity')
  getIssuesBySeverity() {
    return this.analyticsService.getIssuesBySeverity();
  }
}
