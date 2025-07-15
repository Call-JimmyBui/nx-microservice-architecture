// apps/product-service/src/categories/category.controller.ts

import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  CATEGORY_SERVICE_NAME,
  CreateCategoryRequest,
  GetCategoryByIdRequest,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
  CategoryResponse,
  CategoriesResponse,
  CategoryServiceControllerMethods,
  CategoryServiceController
} from '@microservice/types'; 

import { Empty } from '@microservice/types';
import { CategoryService } from './category.service';

@Controller()
@CategoryServiceControllerMethods()
export class CategoryController implements CategoryServiceController {
  constructor(
    @Inject(CategoryService) private readonly categoryService: CategoryService,
  ) {}

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'CreateCategory')
  async createCategory(request: CreateCategoryRequest): Promise<CategoryResponse> {
    const category = await this.categoryService.createCategory(request);
    return { category: this.categoryService.mapCategoryToProto(category) };
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'GetCategoryById')
  async getCategoryById(request: GetCategoryByIdRequest): Promise<CategoryResponse> {
    const category = await this.categoryService.getCategoryById(request.id);
    if (!category) {
      return { category: undefined };
    }
    return { category: this.categoryService.mapCategoryToProto(category) };
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'GetAllCategories')
  async getAllCategories(request: Empty): Promise<CategoriesResponse> {
    const categories = await this.categoryService.getAllCategories();
    return { categories: categories.map(c => this.categoryService.mapCategoryToProto(c)) };
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'UpdateCategory')
  async updateCategory(request: UpdateCategoryRequest): Promise<CategoryResponse> {
    const category = await this.categoryService.updateCategory(request.id, request);
    if (!category) {
      return { category: undefined };
    }
    return { category: this.categoryService.mapCategoryToProto(category) };
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'DeleteCategory')
  async deleteCategory(request: DeleteCategoryRequest): Promise<Empty> {
    await this.categoryService.deleteCategory(request.id);
    return {};
  }
}