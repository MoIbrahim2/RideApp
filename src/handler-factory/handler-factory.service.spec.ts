import { Test, TestingModule } from '@nestjs/testing';
import { HandlerFactoryService } from './handler-factory.service';

describe('HandlerFactoryService', () => {
  let service: HandlerFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandlerFactoryService],
    }).compile();

    service = module.get<HandlerFactoryService>(HandlerFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
