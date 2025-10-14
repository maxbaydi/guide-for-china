import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollectionInput, UpdateCollectionInput, AddToCollectionInput } from '../dto/collection.dto';
import { Collection, CollectionItem } from '@prisma/client';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async createCollection(
    userId: string,
    data: CreateCollectionInput,
  ): Promise<any> {
    const maxSortOrder = await this.prisma.collection.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });

    const collection = await this.prisma.collection.create({
      data: {
        ...data,
        userId,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
      include: {
        items: true,
      },
    });

    return {
      ...collection,
      itemCount: collection.items.length,
    };
  }

  async getUserCollections(userId: string): Promise<any[]> {
    const collections = await this.prisma.collection.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return collections.map((collection) => ({
      ...collection,
      itemCount: collection.items.length,
    }));
  }

  async getCollection(collectionId: string, userId: string): Promise<any> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId && !collection.isPublic) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    return {
      ...collection,
      itemCount: collection.items.length,
    };
  }

  async updateCollection(
    collectionId: string,
    userId: string,
    data: UpdateCollectionInput,
  ): Promise<any> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    const updated = await this.prisma.collection.update({
      where: { id: collectionId },
      data,
      include: {
        items: true,
      },
    });

    return {
      ...updated,
      itemCount: updated.items.length,
    };
  }

  async deleteCollection(collectionId: string, userId: string): Promise<boolean> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    await this.prisma.collection.delete({
      where: { id: collectionId },
    });

    return true;
  }

  async addCharacterToCollection(
    collectionId: string,
    userId: string,
    data: AddToCollectionInput,
  ): Promise<CollectionItem> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    // Check if character already exists in collection
    const existingItem = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_characterId: {
          collectionId,
          characterId: data.characterId,
        },
      },
    });

    if (existingItem) {
      throw new BadRequestException('Character already exists in this collection');
    }

    const maxSortOrder = await this.prisma.collectionItem.aggregate({
      where: { collectionId },
      _max: { sortOrder: true },
    });

    return this.prisma.collectionItem.create({
      data: {
        collectionId,
        characterId: data.characterId,
        notes: data.notes,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
    });
  }

  async removeCharacterFromCollection(
    collectionId: string,
    characterId: string,
    userId: string,
  ): Promise<boolean> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    const item = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_characterId: {
          collectionId,
          characterId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Character not found in collection');
    }

    await this.prisma.collectionItem.delete({
      where: { id: item.id },
    });

    return true;
  }

  async updateCollectionItemNotes(
    collectionId: string,
    characterId: string,
    userId: string,
    notes: string,
  ): Promise<CollectionItem> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    const item = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_characterId: {
          collectionId,
          characterId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Character not found in collection');
    }

    return this.prisma.collectionItem.update({
      where: { id: item.id },
      data: { notes },
    });
  }

  async getCharacterCollections(
    characterId: string,
    userId: string,
  ): Promise<Collection[]> {
    return this.prisma.collection.findMany({
      where: {
        userId,
        items: {
          some: {
            characterId,
          },
        },
      },
      include: {
        items: true,
      },
    });
  }
}

