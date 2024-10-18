import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
  WinstonModuleOptions,
} from 'nest-winston'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { env, envString, isDev } from '~/env'

const consoleTransports = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    nestWinstonModuleUtilities.format.nestLike(),
  ),
})

const dailyRotateFileInfo: DailyRotateFile = new DailyRotateFile({
  // 日志记录级别名称，如果未指定，将使用 createLogger 方法中的选项
  level: env('APP_LOGGER_LEVEL'),
  // 保存日志文件的目录名。 (默认值：'.')
  // dirname: `${process.cwd()}/logs`,
  // 用于记录日志的文件名。该文件名可以包含 %DATE% 占位符，它将包含文件名中该点的格式化日期格式。 (默认值：'winston.log.%DATE%')
  filename: 'logs/app.%DATE%.log',
  // moment.js 日期格式的字符串。该字符串中使用的元字符将决定文件轮换的频率。
  // 例如，如果 datePattern 只是 'HH'，那么最终会有 24 个日志文件，每天都会被拾取并添加到日志文件中。(默认：'YYYY-MM-DD')
  datePattern: 'YYYY-MM-DD',
  // 文件的最大大小，超过该大小后将进行切分。
  // 可以是字节数，也可以是 kb、mb 或 gb 单位。如果使用单位，请添加 'k'、'm'或 'g'作为后缀。单位必须直接跟在数字后面。 (默认值：空)
  maxSize: envString('APP_LOGGER_MAX_SIZE'),
  // 保留日志的最大数量。如果未设置，则不会删除任何日志。
  // 可以是文件数或天数。如果使用天数，请添加 'd' 作为后缀。它使用 auditFile 来跟踪 json 格式的日志文件。它不会删除任何未包含在其中的文件。可以是文件数或天数（默认值：空）
  maxFiles: envString('APP_LOGGER_MAX_FILES'),
  // 用于定义是否对归档日志文件进行压缩。 (默认值：'false')
  zippedArchive: true,
  // 日志格式化
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    // winston.format.simple(),
  ),
  auditFile: 'logs/.audit/app.json',
})

const dailyRotateFileError: DailyRotateFile = new DailyRotateFile({
  // 日志记录级别名称，如果未指定，将使用 createLogger 方法中的选项
  level: 'error',
  // 保存日志文件的目录名。 (默认值：'.')
  // dirname: `${process.cwd()}/logs`,
  // 用于记录日志的文件名。该文件名可以包含 %DATE% 占位符，它将包含文件名中该点的格式化日期格式。 (默认值：'winston.log.%DATE%')
  filename: 'logs/app-error.%DATE%.log',
  // moment.js 日期格式的字符串。该字符串中使用的元字符将决定文件轮换的频率。
  // 例如，如果 datePattern 只是 'HH'，那么最终会有 24 个日志文件，每天都会被拾取并添加到日志文件中。(默认：'YYYY-MM-DD')
  datePattern: 'YYYY-MM-DD',
  // 文件的最大大小，超过该大小后将进行切分。
  // 可以是字节数，也可以是 kb、mb 或 gb 单位。如果使用单位，请添加 'k'、'm'或'g'作为后缀。单位必须直接跟在数字后面。 (默认值：空)
  maxSize: envString('APP_LOGGER_MAX_SIZE'),
  // 保留日志的最大数量。如果未设置，则不会删除任何日志。
  // 可以是文件数或天数。如果使用天数，请添加 'd' 作为后缀。它使用 auditFile 来跟踪 json 格式的日志文件。它不会删除任何未包含在其中的文件。可以是文件数或天数（默认值：空）
  maxFiles: envString('APP_LOGGER_MAX_FILES'),
  // 用于定义是否对归档日志文件进行压缩。 (默认值：'false')
  zippedArchive: true,
  // 日志格式化
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    // winston.format.simple(),
  ),
  auditFile: 'logs/.audit/app-error.json',
})

const winstonTransportsList: WinstonModuleOptions['transports'] = [
  dailyRotateFileError,
  dailyRotateFileInfo,
]

if (isDev) {
  winstonTransportsList.push(consoleTransports)
}

export const LoggerService = WinstonModule.createLogger({
  transports: winstonTransportsList,
})
