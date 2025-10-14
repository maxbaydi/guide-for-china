import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { AuthProvider, UserRole } from '@prisma/client';

registerEnumType(AuthProvider, {
  name: 'AuthProvider',
  description: 'Authentication provider types',
});

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role types',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;
}

