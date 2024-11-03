import { RedisModule as NestRedisModule, RedisService } from '@liaoliaots/nestjs-redis'
import { CacheModule, CacheStore } from '@nestjs/cache-manager'
import { Global, Module, Provider } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-ioredis-yet'
import { RedisOptions } from 'ioredis'

import { REDIS_CLIENT } from '~/common/decorators'
import { ConfigKeyPaths, IRedisConfig } from '~/config'
import { REDIS_PUBSUB } from '~/constants'
import { CacheService } from './cache.service'
import { RedisSubPub } from './redis-subpub'
import { RedisPubSubService } from './subpub.service'

const providers: Provider[] = [
  // 用于管理缓存
  CacheService,
  // 使用 useFactory 动态配置发布/订阅服务 RedisSubPub。通过注入 ConfigService，从配置中获取 Redis 的连接选项。
  {
    provide: REDIS_PUBSUB,
    useFactory: (configService: ConfigService<ConfigKeyPaths>) => {
      const redisOptions: RedisOptions = configService.get<IRedisConfig>('redis')
      return new RedisSubPub(redisOptions)
    },
    inject: [ConfigService],
  },
  // 封装 Redis 发布/订阅功能
  RedisPubSubService,
  {
    provide: REDIS_CLIENT,
    useFactory: (redisService: RedisService) => {
      return redisService.getOrThrow()
    },
    inject: [RedisService], // 注入 RedisService
  },
]

@Global()
@Module({
  imports: [
    // register : 用于同步配置。所有配置项必须在编译时已知，不支持依赖外部服务或异步操作的场景。
    // registerAsync : 用于异步配置，允许在运行时动态获取配置，适用于依赖外部服务（如数据库、环境变量、API 调用等）的场景
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigKeyPaths>) => {
        const redisOptions: RedisOptions = configService.get<IRedisConfig>('redis')

        return {
          isGlobal: true,
          // 指定 cache-manager-ioredis-yet 作为缓存存储
          store: redisStore as unknown as CacheStore,
          // 控制缓存策略；设置为 () => true，表示所有值都可缓存。
          isCacheableValue: () => true,
          ...redisOptions,
        }
      },
      inject: [ConfigService],
    }),
    // forRoot : 用于同步配置，所有配置项在编译时就必须已知，不支持依赖外部异步资源的场景。只调用一次，适合全局单例模块。
    // forRootAsync : 用于异步配置，允许在运行时动态获取配置，适用于需要通过外部服务（如环境变量、数据库、API 等）进行配置的场景。只调用一次，适合全局单例模块。
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigKeyPaths>) => ({
        // 默认为 false 。设置为 true 时，在 Redis 准备就绪时输出日志。
        readyLog: true,
        // 用于指定单个或多个 Redis 客户端。
        config: configService.get<IRedisConfig>('redis'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers,
  exports: [...providers, CacheModule],
})

export class RedisModule {}
