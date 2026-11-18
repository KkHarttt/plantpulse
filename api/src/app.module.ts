import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RolesGuard } from './guards/roles.guard.js';
import { EquipmentModule } from './equipment/equipment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EquipmentModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}