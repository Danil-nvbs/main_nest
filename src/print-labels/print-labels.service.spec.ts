import { Test, TestingModule } from '@nestjs/testing';
import { PrintLabelsService } from './print-labels.service';

describe('PrintLabelsService', () => {
  let service: PrintLabelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrintLabelsService],
    }).compile();

    service = module.get<PrintLabelsService>(PrintLabelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
