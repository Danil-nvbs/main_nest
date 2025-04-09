import { Test, TestingModule } from '@nestjs/testing';
import { PrintLabelsController } from './print-labels.controller';

describe('PrintLabelsController', () => {
  let controller: PrintLabelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrintLabelsController],
    }).compile();

    controller = module.get<PrintLabelsController>(PrintLabelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
