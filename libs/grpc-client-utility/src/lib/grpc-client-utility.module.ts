// libs/grpc-client-utility/src/lib/grpc-client-utility.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

export interface GrpcClientOptions {
  name: string; 
  protobufPackage: string; 
  protoFileName: string; 
  envPortKey: string;
}

@Module({})
export class GrpcClientUtilityModule {
  static registerClients(optionsArray: GrpcClientOptions[]): DynamicModule {
    const clients = optionsArray.map(options => ({
      name: options.name,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Record<string, any>>) => ({
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, options.protoFileName),
          package: options.protobufPackage,
          url: `localhost:${configService.get<string>(options.envPortKey)}`,
          loader: {
            keepCase: true,
          },
        },
      }),
    }));

    return {
      module: GrpcClientUtilityModule,
      imports: [ClientsModule.registerAsync(clients as any)],
      exports: [ClientsModule],
    };
  }
}