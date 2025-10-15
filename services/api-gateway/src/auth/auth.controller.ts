import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional, MaxLength, Matches } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

class LogoutDto {
  @IsString()
  refreshToken: string;
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    try {
      return await this.authService.register(
        body.email,
        body.password,
        body.username,
        body.displayName,
      );
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(body.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.authService.getMe(token);
      return { user }; // Обернуть результат для соответствия ожиданиям фронтенда
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('authorization') authorization: string,
    @Body() body: LogoutDto,
  ) {
    const token = authorization?.replace('Bearer ', '');
    try {
      return await this.authService.logout(token, body.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Logout failed');
    }
  }
}

