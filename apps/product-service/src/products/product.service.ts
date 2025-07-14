import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { status as GrpcStatus } from '@grpc/grpc-js'; // Import GrpcStatus

import {
  CreateProductRequest,
  GetAllProductsRequest,
  UpdateProductRequest,
  ProductProto,
} from '@microservice/types'; 

import { GrpcExceptionFactory, FieldKey } from '@microservice/common';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createProduct(data: CreateProductRequest): Promise<ProductProto> {
    
    const existingProductByName = await this.productRepository.findOne({ where: { name: data.name } });
    if (existingProductByName) {
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT, GrpcStatus.ALREADY_EXISTS);
    }

    const newProduct = this.productRepository.create(data);

    const savedProduct = await this.productRepository.save(newProduct);

    return this.mapProductToProto(savedProduct); 
  }

  async getProductById(id: string): Promise<ProductProto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT, GrpcStatus.NOT_FOUND);
    }
    return this.mapProductToProto(product);
  }

  async getProductsByIds(ids: string[]): Promise<ProductProto[]> {
    if (!ids || ids.length === 0) {
      return []; // Trả về mảng rỗng nếu không có ID nào được cung cấp
    }
    const products = await this.productRepository.findByIds(ids); // Sử dụng findByIds
    return products.map(product => this.mapProductToProto(product));
  }

  async decreaseStock(productId: string, quantity: number): Promise<{ success: boolean; currentStock: number }> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT, GrpcStatus.NOT_FOUND);
    }

    if (product.stockQuantity < quantity) {
      // Nếu số lượng tồn kho không đủ
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT_OUT_OF_STOCK, GrpcStatus.FAILED_PRECONDITION);
    }

    product.stockQuantity -= quantity;
    await this.productRepository.save(product);

    return { success: true, currentStock: product.stockQuantity };
  }

  async getAllProducts(options: GetAllProductsRequest): Promise<{ products: ProductProto[]; totalCount: number }> {
    const { page = 1, limit = 10, search, categoryId } = options;
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }
    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    const [products, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const productProtos = products.map(product => this.mapProductToProto(product));

    return { products: productProtos, totalCount };
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductProto> {
    const productToUpdate = await this.productRepository.findOne({ where: { id } });
    if (!productToUpdate) {
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT, GrpcStatus.NOT_FOUND);
    }

    this.productRepository.merge(productToUpdate, data);
    const updatedProduct = await this.productRepository.save(productToUpdate);
    return this.mapProductToProto(updatedProduct); 
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT, GrpcStatus.NOT_FOUND);
    }
  }

  async getProductsByCategoryId(categoryId: string): Promise<ProductProto[]> {
    const products = await this.productRepository.find({ where: { categoryId } });
    return products.map(product => this.mapProductToProto(product));
  }

  async checkProductStock(productId: string, quantity: number): Promise<{ isAvailable: boolean; currentStock: number }> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw GrpcExceptionFactory.create(FieldKey.Product.PRODUCT, GrpcStatus.NOT_FOUND);
    }
    const isAvailable = product.stockQuantity >= quantity;
    return { isAvailable, currentStock: product.stockQuantity };
  }

  mapProductToProto(product: Product): ProductProto {
    
    // Xử lý giá trị Date sang Timestamp Proto
    const createdAtSeconds = Math.floor(product.createdAt.getTime() / 1000);
    const createdAtNanos = (product.createdAt.getTime() % 1000) * 1_000_000;
    
    const updatedAtSeconds = Math.floor(product.updatedAt.getTime() / 1000);
    const updatedAtNanos = (product.updatedAt.getTime() % 1000) * 1_000_000;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      createdAt: { seconds: createdAtSeconds, nanos: createdAtNanos },
      updatedAt: { seconds: updatedAtSeconds, nanos: updatedAtNanos },
      isActive: product.isActive,
      categoryId: product.categoryId,
    };
  }
}