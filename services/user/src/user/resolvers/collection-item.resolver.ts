import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { CollectionItem, CharacterInCollection } from '../entities/collection-item.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Resolver(() => CollectionItem)
export class CollectionItemResolver {
  private readonly dictionaryServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const dictionaryHost = this.configService.get('DICTIONARY_SERVICE_HOST', 'localhost');
    const dictionaryPort = this.configService.get('DICTIONARY_SERVICE_PORT', '4001');
    this.dictionaryServiceUrl = `http://${dictionaryHost}:${dictionaryPort}/graphql`;
  }

  @ResolveField(() => CharacterInCollection, { nullable: true })
  async character(@Parent() item: CollectionItem): Promise<CharacterInCollection | null> {
    try {
      const query = `
        query GetCharacter($id: String!) {
          getCharacter(id: $id) {
            id
            simplified
            pinyin
            hskLevel
            definitions {
              translation
            }
          }
        }
      `;

      const { data } = await firstValueFrom(
        this.httpService.post(this.dictionaryServiceUrl, {
          query,
          variables: { id: item.characterId },
        }),
      );

      if (data.errors || !data.data?.getCharacter) {
        return null;
      }

      const character = data.data.getCharacter;
      
      return {
        id: character.id,
        simplified: character.simplified,
        pinyin: character.pinyin,
        definitions: character.definitions.map((d: any) => d.translation),
        hskLevel: character.hskLevel,
      };
    } catch (error) {
      console.error(`Failed to fetch character ${item.characterId}:`, error.message);
      return null;
    }
  }
}


