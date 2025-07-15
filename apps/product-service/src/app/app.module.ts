import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@microservice/database'
import { Product } from '../products/entities/product.entity';
import { ProductModule } from '../products/product.module';
import { CategoryModule } from '../categories/category.module';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot({
      entities: [Product, Category],
      databaseNameEnvKey: 'PRODUCT_DB_DATABASE', 
    }),
    ProductModule,
    CategoryModule
  ],
})
export class AppModule {}
