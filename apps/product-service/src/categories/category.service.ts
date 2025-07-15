// apps/product-service/src/categories/category.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryProto,
} from '@microservice/types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category | undefined> {
    await this.categoryRepository.update(id, data);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async deleteCategory(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
  }

  // Helper để map Entity TypeORM sang Proto interface
  // Nên để hàm này ở đây hoặc ở một utility chung
  mapCategoryToProto(category: Category): CategoryProto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: { seconds: Math.floor(category.createdAt.getTime() / 1000), nanos: (category.createdAt.getTime() % 1000) * 1_000_000 },
      updatedAt: { seconds: Math.floor(category.updatedAt.getTime() / 1000), nanos: (category.updatedAt.getTime() % 1000) * 1_000_000 },
    };
  }
}