import { Test, TestingModule } from '@nestjs/testing';
import { MarginController } from './margin.controller';

describe('MarginController', () => {
  let controller: MarginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarginController],
    }).compile();

    controller = module.get<MarginController>(MarginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
