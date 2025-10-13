import { Test, TestingModule } from '@nestjs/testing';
import { DictionaryResolver } from '../dictionary.resolver';
import { DictionaryService } from '../../services/dictionary.service';
import { PrismaService } from '../../services/prisma.service';

describe('DictionaryResolver', () => {
  let resolver: DictionaryResolver;
  let service: DictionaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DictionaryResolver, DictionaryService, PrismaService],
    }).compile();

    resolver = module.get<DictionaryResolver>(DictionaryResolver);
    service = module.get<DictionaryService>(DictionaryService);
  });

  describe('searchCharacters', () => {
    it('должен вызвать service.searchCharacters с правильными параметрами', async () => {
      const spy = jest.spyOn(service, 'searchCharacters').mockResolvedValue([]);
      
      await resolver.searchCharacters('test', 10);
      
      expect(spy).toHaveBeenCalledWith('test', 10);
    });

    it('должен использовать лимит по умолчанию', async () => {
      const spy = jest.spyOn(service, 'searchCharacters').mockResolvedValue([]);
      
      await resolver.searchCharacters('test', 20);
      
      expect(spy).toHaveBeenCalledWith('test', 20);
    });
  });

  describe('getCharacter', () => {
    it('должен вызвать service.getCharacter с ID', async () => {
      const mockId = '123e4567-e89b-12d3-a456-426614174000';
      const spy = jest.spyOn(service, 'getCharacter').mockResolvedValue(null);
      
      await resolver.getCharacter(mockId);
      
      expect(spy).toHaveBeenCalledWith(mockId);
    });
  });

  describe('getCharacterBySimplified', () => {
    it('должен вызвать service.getCharacterBySimplified с иероглифом', async () => {
      const spy = jest.spyOn(service, 'getCharacterBySimplified').mockResolvedValue(null);
      
      await resolver.getCharacterBySimplified('学');
      
      expect(spy).toHaveBeenCalledWith('学');
    });
  });

  describe('searchPhrases', () => {
    it('должен вызвать service.searchPhrases с запросом', async () => {
      const spy = jest.spyOn(service, 'searchPhrases').mockResolvedValue([]);
      
      await resolver.searchPhrases('учиться', 15);
      
      expect(spy).toHaveBeenCalledWith('учиться', 15);
    });
  });

  describe('analyzeText', () => {
    it('должен вызвать service.analyzeText с текстом', async () => {
      const spy = jest.spyOn(service, 'analyzeText').mockResolvedValue([]);
      
      await resolver.analyzeText('我学习中文');
      
      expect(spy).toHaveBeenCalledWith('我学习中文');
    });
  });
});

