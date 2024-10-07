import { createLogger, format, transports } from 'winston';
// import pino from 'pino';

const development = 'development';
const production = 'production';
const LOG_LEVEL = 'debug'; // process.env.LOG_LEVEL || "debug";
const NODE_ENV = process.env.NODE_ENV || development;
const DEBUG = process.env.DEBUG || false;

export function init(name: string = 'App') {
  const jsonFormat = format.combine(format.timestamp(), format.json());
  const logger = createLogger({
    level: LOG_LEVEL,
    format: format.json(),
    defaultMeta: { service: name },
  });

  if (NODE_ENV !== development) {
    logger.add(
      new transports.Console({
        format: jsonFormat,
      }),
    );
  }

  if (NODE_ENV !== production) {
    const simpleFormat = format.printf(({ level, message, label, timestamp, stack }) => {
      return `${timestamp} [${label || 'App'}] ${level}: ${message}${DEBUG && stack ? `\n${stack}` : ''}`;
    });
    logger.add(
      new transports.Console({
        format: format.combine(format.colorize(), format.timestamp(), simpleFormat),
      }),
    );
  }

  // let transport: any = undefined;
  // if (NODE_ENV === development) {
  //   transport = {
  //     target: 'pino-pretty',
  //     options: {
  //       colorize: true,
  //       ignore: 'pid,hostname',
  //     },
  //   }
  // }

  // const logger = pino({
  //   level: 'debug',
  //   transport,
  // });

  enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
  }

  function logLevelValue(level: string) {
    switch (level) {
      case 'debug':
        return 0;
      case 'info':
        return 1;
      case 'warn':
        return 2;
      case 'error':
        return 3;
      default:
        return 4;
    }
  }

  const debug = (message: string, ...args: any[]) => {
    if (logLevelValue(LOG_LEVEL) > LogLevel.DEBUG) return;
    let e = new Error();
    let frame = e.stack?.split('\n')[2]; // change to 3 for grandparent func
    let lineNumber = frame?.split(':').reverse()[1];
    let functionName = frame?.split(' ')[5];
    let file = frame?.match(/src\/[a-zA-Z.:0-9]*/)?.[0];
    logger.child({ label: functionName, lineNumber, file }).debug(message, ...args);
  };

  const info = (message: string, ...args: any[]) => {
    if (logLevelValue(LOG_LEVEL) > LogLevel.INFO) return;
    let e = new Error();
    let frame = e.stack?.split('\n')[2]; // change to 3 for grandparent func
    let lineNumber = frame?.split(':').reverse()[1];
    let functionName = frame?.split(' ')[5];
    let file = frame?.match(/src\/[a-zA-Z.:0-9]*/)?.[0];
    logger.child({ label: functionName, lineNumber, file }).info(message, ...args);
  };

  const warn = (message: string, ...args: any[]) => {
    if (logLevelValue(LOG_LEVEL) > LogLevel.WARN) return;
    let e = new Error();
    let frame = e.stack?.split('\n')[2]; // change to 3 for grandparent func
    let lineNumber = frame?.split(':').reverse()[1];
    let functionName = frame?.split(' ')[5];
    let file = frame?.match(/src\/[a-zA-Z.:0-9]*/)?.[0];
    logger.child({ label: functionName, lineNumber, file }).warn(message, ...args);
  };

  const error = (message: string, ...args: any[]) => {
    if (logLevelValue(LOG_LEVEL) > LogLevel.ERROR) return;
    let e = new Error();
    let frame = e.stack?.split('\n')[2]; // change to 3 for grandparent func
    let lineNumber = frame?.split(':').reverse()[1];
    let functionName = frame?.split(' ')[5];
    let file = frame?.match(/src\/[a-zA-Z.:0-9]*/)?.[0];
    logger.child({ label: functionName, lineNumber, file }).error(message, ...args);
  };

  console.log = info;
  console.debug = debug;
  console.info = info;
  console.warn = warn;
  console.error = error;

  return logger;
}
