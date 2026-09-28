import { ConsoleHandler, setup as std_setup } from '@std/log';
import type { CliArgs } from './cli.ts';

export default function setup(args: CliArgs): void {
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
