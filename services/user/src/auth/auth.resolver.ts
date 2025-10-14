import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') registerInput: RegisterInput,
  ): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<AuthResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Args('refreshToken') refreshToken: string,
  ): Promise<boolean> {
    return this.authService.logout(user.id, refreshToken);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@CurrentUser() user: User): Promise<boolean> {
    return this.authService.logoutAll(user.id);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}

