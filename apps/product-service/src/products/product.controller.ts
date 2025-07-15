// apps/product-service/src/products/product.controller.ts

import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  PRODUCT_SERVICE_NAME,
  CreateProductRequest,
  GetProductByIdRequest,
  GetAllProductsRequest,
  UpdateProductRequest,
  DeleteProductRequest,
  GetProductsByCategoryIdRequest,
  CheckProductStockRequest,
  CheckProductStockResponse,
  ProductResponse,
  ProductsResponse,
  ProductServiceController,
  ProductServiceControllerMethods,
  DecreaseStockRequest,
  DecreaseStockResponse,
  GetProductsByIdsRequest,
} from '@microservice/types'; 

import { Empty } from '@microservice/types';

import { ProductService } from './product.service';
import { Observable } from 'rxjs';

@Controller()
@ProductServiceControllerMethods() 
export class ProductController implements ProductServiceController {
  constructor(
    @Inject(ProductService) private readonly productService: ProductService,
  ) {}
  @GrpcMethod(PRODUCT_SERVICE_NAME, 'GetProductsByIds')
  async getProductsByIds(request: GetProductsByIdsRequest): Promise<ProductsResponse> {
    const products = await this.productService.getProductsByIds(request.ids);
    return {
      products,
      totalCount: products.length, // Cập nhật tổng số lượng
      page: 1, // Giả định trang 1 cho yêu cầu này
      limit: products.length, // Giả định lấy tất cả các sản phẩm tìm thấy
    };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'DecreaseStock')
  async decreaseStock(request: DecreaseStockRequest): Promise<DecreaseStockResponse> {
    const { success, currentStock } = await this.productService.decreaseStock(
      request.productId,
      request.quantity,
    );
    return { success, newStockQuantity: currentStock };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'CreateProduct')
  async createProduct(request: CreateProductRequest): Promise<ProductResponse> {
    const product = await this.productService.createProduct(request);
    return { product };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'GetProductById')
  async getProductById(request: GetProductByIdRequest): Promise<ProductResponse> {
    const product = await this.productService.getProductById(request.id);

    return { product };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'GetAllProducts')
  async getAllProducts(request: GetAllProductsRequest): Promise<ProductsResponse> {
    const { products, totalCount } = await this.productService.getAllProducts(request);
    return {
      products,
      totalCount: totalCount,
      page: request.page,
      limit: request.limit,
    };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'UpdateProduct')
  async updateProduct(request: UpdateProductRequest): Promise<ProductResponse> {
    const product = await this.productService.updateProduct(request.id, request);
    if (!product) {
      return { product: undefined };
    }
    return { product };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'DeleteProduct')
  async deleteProduct(request: DeleteProductRequest): Promise<Empty> {
    await this.productService.deleteProduct(request.productId);
    return {};
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'GetProductsByCategoryId')
  async getProductsByCategoryId(request: GetProductsByCategoryIdRequest): Promise<ProductsResponse> {
    const products = await this.productService.getProductsByCategoryId(request.categoryId);
    return { products, totalCount: products.length, page: 1, limit: products.length };
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'CheckProductStock')
  async checkProductStock(request: CheckProductStockRequest): Promise<CheckProductStockResponse> {
    const { isAvailable, currentStock } = await this.productService.checkProductStock(request.productId, request.quantity);
    return { isAvailable, currentStock };
  }

}