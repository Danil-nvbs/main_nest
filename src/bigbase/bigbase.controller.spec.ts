import { Test } from '@nestjs/testing';
import { BigbaseController } from './bigbase.controller';
import { CreateProductDto } from './dto';
import { BigbaseService } from './bigbase.service';
import { UsersService } from 'src/users/users.service';


describe('BigBase Controller', () => {
  const products: CreateProductDto[] = [
    { article: '123' },
    { article: '124' },
    { article: '125' },
  ];

  let controller: BigbaseController;
  let productService: BigbaseService;
  let usersService: UsersService;

  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      controllers: [BigbaseController],
      providers: [
        {
          provide: BigbaseService,
          useValue: {
            get: jest.fn(() => [products]),
            create: jest.fn(() => [products]),
            update: jest.fn(() => [products]),
            createFromTable: jest.fn(() => []),
            updateFromTable: jest.fn(() => [])
          },
        },
        UsersService,
      ],
    }).compile();
    controller = modRef.get(BigbaseController);
    productService = modRef.get<BigbaseService>(BigbaseService);
    usersService = modRef.get<UsersService>(UsersService);
  });


  it('Получение продуктов + вызов метода get сервиса', async () => {
    const productsList = await controller.get({ columns: ['article'] });
    
    expect(productService.getProducts).toHaveBeenCalled();
    expect(productsList).toEqual(products.map(({ article }) => { article }));
  });


  it('Создание продуктов + вызов метода create сервиса (с валидным токеном)', async () => {
    const newProducts = await controller.create(products);
    expect(productService.createProducts).toHaveBeenCalled();
    
    expect(newProducts).toEqual(products);
  });


  it('Получение списка продуктов по фильтру', async () => {
    const productsList = await controller.get({ columns: ['article'], filters: [{ article: products[0].article}] });
    
    expect(productService.getProducts).toHaveBeenCalled();
    expect(productsList).toEqual([products[0]]);
  });


  it('Обновление продукта', async () => {
    const newProducts = await controller.create(products);
    expect(productService.createProducts).toHaveBeenCalled();
    expect(newProducts).toEqual(products);
    
    const updatedProducts = await controller.update(products.map(({ article }) => ({ article, name: 'some name'})));
    expect(updatedProducts).not.toEqual(products);
    expect(updatedProducts).toEqual(products.map(({ article }) => ({ article, name: 'some name'})));
    expect(productService.updateProducts).toHaveBeenCalled();
  });
});