import { Resolver, Query, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileInput, ChangePasswordInput } from './dto/profile.dto';

@ObjectType()
class UserStatistics {
  @Field()
  searchCount: number;

  @Field()
  analysisCount: number;

  @Field()
  charactersLearned: number;

  @Field()
  studyTimeMinutes: number;

  @Field()
  lastActiveAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  collectionsCount: number;

  @Field()
  totalCharactersInCollections: number;
}

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    // Возвращаем пользователя с актуальным счетчиком запросов из Redis
    const userWithRateLimits = await this.userService.findByIdWithRateLimits(user.id);
    return userWithRateLimits || user;
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async user(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Query(() => UserStatistics)
  @UseGuards(JwtAuthGuard)
  async myStatistics(@CurrentUser() user: User): Promise<UserStatistics> {
    return this.userService.getUserStatistics(user.id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.userService.updateProfile(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Args('input') input: ChangePasswordInput,
  ): Promise<boolean> {
    return this.userService.changePassword(
      user.id,
      input.currentPassword,
      input.newPassword,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMyAccount(@CurrentUser() user: User): Promise<boolean> {
    return this.userService.deleteAccount(user.id);
  }

  @Mutation(() => Boolean)
  async incrementSearchCount(@Args('userId') userId: string): Promise<boolean> {
    await this.userService.incrementSearchCount(userId);
    return true;
  }

  @Mutation(() => Boolean)
  async incrementAnalysisCount(@Args('userId') userId: string): Promise<boolean> {
    await this.userService.incrementAnalysisCount(userId);
    return true;
  }
}

