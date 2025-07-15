import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

interface DatabaseModuleOptions {
  entities: any[];
  databaseNameEnvKey: string; 
}

@Module({}) 
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule, 
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get<string>('DB_HOST'),
            port: parseInt(config.get<string>('DB_PORT', '5432')),
            username: config.get<string>('DB_USERNAME'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>(options.databaseNameEnvKey), 
            entities: options.entities, 
            synchronize: config.get<boolean>('DB_SYNCHRONIZE', true), 
          }),
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}