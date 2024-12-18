import process from 'node:process'
import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { API_SECURITY_AUTH } from './common/decorators/swagger.decorator'
import { ConfigKeyPaths, IAppConfig, ISwaggerConfig } from './config'

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService<ConfigKeyPaths>,
) {
  const { name, port } = configService.get<IAppConfig>('app')
  const { enable, path } = configService.get<ISwaggerConfig>('swagger')!

  if (!enable)
    return

  // DocumentBuilder 构建符合 OpenAPI 规范的基本文档。提供了几种方法，允许设置标题、描述、版本等属性。
  const documentBuilder = new DocumentBuilder()
    .setTitle(name)
    .setDescription(`${name} API document`)

  if (process.env.API_VERSION) {
    documentBuilder.setVersion(process.env.API_VERSION)
  }

  documentBuilder.addSecurity(API_SECURITY_AUTH, {
    description: '输入令牌（Enter the token）',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })

  const document = SwaggerModule.createDocument(
    app,
    documentBuilder.build(),
    {
      ignoreGlobalPrefix: false,
      extraModels: [],
    },
  )

  SwaggerModule.setup(
    path,
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true, // 保持登录
      },
    },
  )

  const logger = new Logger('SwaggerModule')
  logger.log(`Document running on http://127.0.0.1:${port}/${path}`)
}
