import type { LevelName } from '@std/log';
import { parseArgs, type ParseOptions } from '@std/cli/parse-args';

const validLogLevels: LevelName[] = ['DEBUG', 'INFO', 'ERROR'];

export interface CliArgs {
  path: string;
  bitratelimit: number;
  loglevel: LevelName;
}

export default function parse(): CliArgs {
  const validFlags = ['bitratelimit', 'loglevel', 'help'];
  const validAliases = ['b', 'l'];
  const valueFlags = ['bitratelimit', 'loglevel'];
  const cliOptions: ParseOptions = {
    alias: {
      bitratelimit: 'b',
      loglevel: 'l',
    },
    string: valueFlags,
    boolean: ['help'],
    default: { bitratelimit: 320, loglevel: 'INFO' },
  };
  const args = parseArgs(Deno.args, cliOptions);

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  const validArgsObjectKeys = [...validAliases, ...validFlags, '_'];
  const unrecognizedFlags = Object.keys(args).filter((flag: string) => !validArgsObjectKeys.includes(flag));
  if (unrecognizedFlags.length > 0) {
    console.error(`error: unknown flag(s): ${unrecognizedFlags.join(', ')}\n`);
    printHelp();
    Deno.exit(1);
  }

  const bitratelimit = Number(args.bitratelimit);
  if (!Number.isFinite(bitratelimit)) {
    console.error(`error: bitratelimit must be a number, got "${args.bitratelimit}"\n`);
    printHelp();
    Deno.exit(1);
  }

  const loglevel = args.loglevel;
  if (!isLogLevel(loglevel)) {
    console.error(`error: loglevel must be one of ${validLogLevels.join(', ')}, got "${loglevel}"\n`);
    printHelp();
    Deno.exit(1);
  }

  return {
    path: parsePath(args._),
    bitratelimit,
    loglevel,
  };
}

function parsePath(positionals: Array<string | number>): string {
  if (positionals.length === 0) {
    console.error('error: missing search path\n');
    printHelp();
    Deno.exit(1);
  }

  if (positionals.length > 1) {
    console.error(`error: expected a single search path, got: ${positionals.join(', ')}\n`);
    printHelp();
    Deno.exit(1);
  }

  return String(positionals[0]);
}

function isLogLevel(value: string | number | boolean | undefined): value is LevelName {
  return typeof value === 'string' && (validLogLevels as string[]).includes(value);
}

function printHelp(): void {
  console.log('Usage: audio-scanner [options] <path>');
  console.log('');
  console.log('Scans <path> for mp3 files below the given bitrate limit.');
  console.log('<path> has to be passed as the last argument');
  console.log('');
  console.log('Options:');
  console.log('  --bitratelimit | -b   Specify bitrate limit in kbps');
  console.log('  --loglevel | -l       Specify log level: ERROR, INFO, DEBUG');
  console.log('  --help                Show help information');
  console.log('');
  console.log('Examples:');
  console.log('  audio-scanner -b 128 /music');
}
