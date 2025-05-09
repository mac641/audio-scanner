import { Args, parseArgs, ParseOptions } from 'jsr:@std/cli/parse-args';

export default async function parse(): Promise<Args> {
  const validFlags = ['bitratelimit', 'loglevel', 'path'];
  const validAliases = ['p', 'b', 'l'];
  const cliOptions: ParseOptions = {
    alias: {
      path: 'p',
      bitratelimit: 'b',
      loglevel: 'l',
    },
    string: validFlags,
    boolean: ['help'],
    default: { path: '.', bitratelimit: 320, loglevel: 'INFO' },
  };
  const args = parseArgs(Deno.args, cliOptions);

  if (args.help) {
    await printHelp();
    Deno.exit(0);
  }

  const validArgsObjectKeys = [...validAliases, ...validFlags, '_'];
  const unrecognizedFlags = Object.keys(args).filter((flag: string) => !validArgsObjectKeys.includes(flag));
  if (unrecognizedFlags.length > 0) {
    await printHelp();
    Deno.exit(1);
  }

  return args;
}

async function printHelp(): Promise<void> {
  console.log('Usage: audio-scanner [options]');
  console.log('Options:');
  console.log('  --help                Show help information');
  console.log('  --path | -p           Specify path to search at');
  console.log('  --bitratelimit | -b   Specify bitrate limit in kbps');
  console.log('  --loglevel | -l       Specify log level: ERROR, INFO, DEBUG');
}
