import { Test, TestingModule } from '@nestjs/testing';
import { RideListenerService } from './ride-listener.service';

describe('RideListenerService', () => {
  let service: RideListenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RideListenerService],
    }).compile();

    service = module.get<RideListenerService>(RideListenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
