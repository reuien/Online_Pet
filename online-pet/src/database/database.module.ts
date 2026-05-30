import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST', 'localhost');
        const port = configService.get<number>('DB_PORT', 5432);
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD', '');
        const database = configService.get<string>('DB_NAME', 'online_pet');

        if (!username) {
          throw new Error(
            'Missing required database environment variable: DB_USERNAME',
          );
        }

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
