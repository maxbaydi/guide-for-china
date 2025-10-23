import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { join } from 'path';
import { DictionaryModule } from './dictionary.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prometheus metrics
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'dictionary_service_',
        },
      },
      defaultLabels: {
        app: 'dictionary-service',
        version: '1.0.0',
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    DictionaryModule,
  ],
})
export class AppModule {}

