import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { AuthProvider, UserRole, SubscriptionTier } from '@prisma/client';

registerEnumType(AuthProvider, {
  name: 'AuthProvider',
  description: 'Authentication provider types',
});

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role types',
});

registerEnumType(SubscriptionTier, {
  name: 'SubscriptionTier',
  description: 'Subscription tier types',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  username?: string;

  // Password hash is intentionally not exposed
  passwordHash?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => AuthProvider)
  provider: AuthProvider;

  @Field({ nullable: true })
  providerId?: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  isActive: boolean;

  @Field()
  emailVerified: boolean;

  @Field(() => SubscriptionTier)
  subscriptionTier: SubscriptionTier;

  @Field(() => Int)
  dailyRequestsUsed: number;

  @Field(() => Int)
  dailyRequestsLimit: number;

  @Field()
  lastRequestReset: Date;

  // Statistics
  @Field(() => Int)
  searchCount: number;

  @Field(() => Int)
  analysisCount: number;

  @Field(() => Int)
  charactersLearned: number;

  @Field(() => Int)
  studyTimeMinutes: number;

  @Field()
  lastActiveAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;
}

