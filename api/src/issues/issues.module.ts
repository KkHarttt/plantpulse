
import { Module } from '@nestjs/common';

import { IssuesService } from './issues.service.js';
import { IssuesController } from './issues.controller.js';

import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';

@Module({
  imports: [AuthModule],
  providers: [
    IssuesService,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [IssuesController],
})
export class IssuesModule {}
