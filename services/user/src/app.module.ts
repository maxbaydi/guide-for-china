import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prometheus metrics
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'user_service_',
        },
      },
      defaultLabels: {
        app: 'user-service',
        version: '1.0.0',
      },
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),

    // Feature modules
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}

