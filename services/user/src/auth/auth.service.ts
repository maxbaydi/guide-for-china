import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const { email, password, username, displayName } = registerInput;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username is already taken
    if (username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName,
        provider: 'EMAIL',
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;

    // Validate user
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(storedToken.user);

      // Save new refresh token
      await this.saveRefreshToken(storedToken.user.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: storedToken.user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<boolean> {
    try {
      await this.prisma.refreshToken.delete({
        where: {
          token: refreshToken,
          userId,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async logoutAll(userId: string): Promise<boolean> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ),
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const expiresAt = new Date();

    // Parse expires in string (e.g., "7d" -> 7 days)
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 's':
          expiresAt.setSeconds(expiresAt.getSeconds() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
      }
    }

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async validateJwtPayload(payload: any): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }
}

