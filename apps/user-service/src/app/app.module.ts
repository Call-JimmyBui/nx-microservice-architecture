import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@microservice/database'
import { User } from '../users/entities/user.entity';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot({
      entities: [User],
      databaseNameEnvKey: 'USER_DB_DATABASE', 
    }),
    UserModule
  ],
})
export class AppModule {}