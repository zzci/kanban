import winston from 'winston'

const loggerImpl = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
})

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    loggerImpl.info(message, meta ?? {})
  },
  warn(message: string, meta?: Record<string, unknown>) {
    loggerImpl.warn(message, meta ?? {})
  },
  error(message: string, meta?: Record<string, unknown>) {
    loggerImpl.error(message, meta ?? {})
  },
}
