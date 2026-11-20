
import { Module } from '@nestjs/common';

import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';

import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';

@Module({
  imports: [AuthModule],
  providers: [
    NotificationsService,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
