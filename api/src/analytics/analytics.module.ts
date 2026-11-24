
import { Module } from '@nestjs/common';

import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';

import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';

@Module({
  imports: [AuthModule],
  providers: [
    AnalyticsService,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
