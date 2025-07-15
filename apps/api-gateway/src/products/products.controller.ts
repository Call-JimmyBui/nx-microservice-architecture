import { mapGrpcErrorToHttp } from '@microservice/common';
import {
  Controller,
  Get,
  Post,
  Body,   
  Param,    
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  ProductServiceClient,
  PRODUCT_SERVICE_NAME,
  CreateProductRequest,
  GetProductByIdRequest,
} from 'types/proto/products'; 

@Controller('products')
export class ProductController implements OnModuleInit {

  private productService: ProductServiceClient; 

  constructor(
    @Inject(PRODUCT_SERVICE_NAME)
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService = this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  @Get(':id')
  async findOne(@Param('id') productId: string){
    try {
      const request: GetProductByIdRequest = { id: productId };
      return await firstValueFrom(this.productService.getProductById(request));
    } catch (error) {
      throw mapGrpcErrorToHttp(error);
    }
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductRequest){        
    try {
      return await firstValueFrom(this.productService.createProduct(createProductDto));
    } catch (error) {
      throw mapGrpcErrorToHttp(error);
    }
  }
}