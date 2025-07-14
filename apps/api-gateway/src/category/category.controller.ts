import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,    
  Delete,  
  Inject,
  OnModuleInit,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CATEGORY_SERVICE_NAME,    
  PRODUCTS_PACKAGE_NAME,     
  CreateCategoryRequest,    
  GetCategoryByIdRequest,   
  UpdateCategoryRequest,      
  DeleteCategoryRequest,    
  CategoryResponse,        
  CategoriesResponse,       
} from '@microservice/types'; 

import { Empty } from 'types/proto/google/protobuf/empty'; 
import { CategoryProto, CategoryServiceClient } from 'types/proto/products';


@Controller('categories')
export class CategoryController implements OnModuleInit {

  @Inject(CATEGORY_SERVICE_NAME) 
  private client: ClientGrpc;

  private categoryService: CategoryServiceClient;

  onModuleInit() {
    this.categoryService = this.client.getService<CategoryServiceClient>(CATEGORY_SERVICE_NAME);
  }

  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryRequest): Promise<CategoryProto> {
    const response: CategoryResponse = await firstValueFrom(this.categoryService.createCategory(createCategoryDto));
    if (!response.category) {
      throw new Error('Category creation failed: No category returned.'); 
    }
    return response.category;
  }

  @Get()
  async getAllCategories(request: Empty): Promise<CategoryProto[]> {
    const response: CategoriesResponse = await firstValueFrom(this.categoryService.getAllCategories(request)); 
    return response.categories;
  }

  @Get(':id')
  async getCategoryById(@Param('id') categoryId: string): Promise<CategoryProto> {
    const request: GetCategoryByIdRequest = { id: categoryId };
    const response: CategoryResponse = await firstValueFrom(this.categoryService.getCategoryById(request));
    if (!response.category) {
      throw new Error('Category not found.'); 
    }
    return response.category;
  }

  @Put(':id')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryRequest,
  ): Promise<CategoryProto> {
    const request: UpdateCategoryRequest = { id: categoryId, ...updateCategoryDto };
    const response: CategoryResponse = await firstValueFrom(this.categoryService.updateCategory(request));
    if (!response.category) {
      throw new Error('Category update failed: No category returned.');
    }
    return response.category;
  }

  @Delete(':id')
  async deleteCategory(@Param('id') categoryId: string): Promise<Empty> {
    const request: DeleteCategoryRequest = { id: categoryId };
    return await firstValueFrom(this.categoryService.deleteCategory(request));
  }
}