import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        provider: provider as any,
        providerId,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateProfile(
    userId: string,
    data: {
      username?: string;
      displayName?: string;
      avatarUrl?: string;
    },
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username is already taken
    if (data.username && data.username !== user.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        lastActiveAt: new Date(),
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found or not using password authentication');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return true;
  }

  async deleteAccount(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all user data (cascading will handle relations)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return true;
  }

  async incrementSearchCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        searchCount: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });
  }

  async incrementAnalysisCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        analysisCount: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });
  }

  async updateStudyTime(userId: string, minutes: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        studyTimeMinutes: { increment: minutes },
        lastActiveAt: new Date(),
      },
    });
  }

  async updateCharactersLearned(userId: string, count: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        charactersLearned: count,
        lastActiveAt: new Date(),
      },
    });
  }

  async getUserStatistics(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        searchCount: true,
        analysisCount: true,
        charactersLearned: true,
        studyTimeMinutes: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const collectionsCount = await this.prisma.collection.count({
      where: { userId },
    });

    const totalCharactersInCollections = await this.prisma.collectionItem.count({
      where: {
        collection: {
          userId,
        },
      },
    });

    return {
      ...user,
      collectionsCount,
      totalCharactersInCollections,
    };
  }

  async verifyEmail(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async deactivateUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }
}

