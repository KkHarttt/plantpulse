
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body()
    body: {
      login: string;
      password: string;
      fullName: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  login(
    @Body()
    body: {
      login: string;
      password: string;
    },
  ) {
    return this.authService.login(body.login, body.password);
  }
}
