import { Args } from 'jsr:@std/cli/parse-args';
import { ConsoleHandler, setup as std_setup } from 'jsr:@std/log';

export default async function setup(args: Args): Promise<void> {
  const logLevels = [
    'DEBUG',
    'INFO',
    'ERROR',
  ];

  if (!logLevels.includes(args.loglevel)) {
    throw new Error(`Log level ${args.loglevel} not found`);
  }

  std_setup({
    handlers: {
      console: new ConsoleHandler(args.loglevel),
    },
    loggers: {
      default: {
        level: args.loglevel,
        handlers: ['console'],
      },
    },
  });
}
