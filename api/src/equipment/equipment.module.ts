
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { EquipmentController } from './equipment.controller.js';
import { EquipmentService } from './equipment.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';

@Module({
  imports: [AuthModule],
  controllers: [EquipmentController],
  providers: [
    EquipmentService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class EquipmentModule {}
