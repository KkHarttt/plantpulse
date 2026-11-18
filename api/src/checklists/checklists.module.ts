
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChecklistsController } from './checklists.controller.js';
import { ChecklistsService } from './checklists.service.js';
import { NormCheckService } from './norm-check.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';

@Module({
  imports: [AuthModule],
  controllers: [ChecklistsController],
  providers: [
    ChecklistsService,
    NormCheckService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class ChecklistsModule {}
