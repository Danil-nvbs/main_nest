import { Test, TestingModule } from '@nestjs/testing';
import { MarginService } from './margin.service';

describe('MarginService', () => {
  let service: MarginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarginService],
    }).compile();

    service = module.get<MarginService>(MarginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
