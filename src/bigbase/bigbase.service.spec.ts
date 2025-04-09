import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { BigbaseModule } from './bigbase.module';
import { getModelToken } from '@nestjs/sequelize';
import { BigbaseService } from './bigbase.service';
import { Product } from './models/product.model';
import { CreateProductDto } from './dto';

describe('BigBase Controller', () => {
  let bigbaseService: BigbaseService;
  let productRepository: typeof Product;

  const items: CreateProductDto[] = [
    { article: '123' },
    { article: '124' },
    { article: '125' },
  ];

  beforeEach(async () => {
    const moduleRef = await Test
      .createTestingModule({
          imports: [
          ConfigModule.forRoot({ envFilePath: '.testing.env'}),
          BigbaseModule,
        ],
        })
      .compile();

    bigbaseService = moduleRef.get<BigbaseService>(BigbaseService);
    productRepository = moduleRef.get<typeof Product>(getModelToken(Product));
  });

  
  it('Создание продуктов', async () => {
    let item = items[0];
  
    await bigbaseService.createProduct(item, 'test.author@gmail.com');
  
    item = await productRepository.findOne({
      where: {
        article: item.article,
      },
    });
  
    expect(item).not.toBeNull();
  });


  it('Получение продуктов (без фильтров)', async () => {
    await productRepository.create(items);
  
    const foundItems = await bigbaseService.getProducts({ columns: ['article'] });
  
    expect(foundItems).toEqual(items);
  });

  
  it('Получение продуктов (с фильтром)', async () => {
    await productRepository.create(items);
  
    const foundItems = await bigbaseService.getProducts({ columns: ['article'], filters: [{ article: '123' }] });
  
    expect(foundItems).toEqual(items.filter(item => item.article === '123'));
  });

  
  it('Получение продуктов (с limit)', async () => {
    const limit = 2;
    
    await productRepository.create(items);
  
    const foundItems = await bigbaseService.getProducts({ columns: ['article'], limit });
  
    expect(foundItems.length).toEqual(limit);
  });
});