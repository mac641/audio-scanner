import { Args, parseArgs, ParseOptions } from 'jsr:@std/cli/parse-args';

export default async function parse(): Promise<Args> {
  const validFlags = ['bitratelimit', 'path', 'loglevel'];
  const validAliases = ['p', 'b', 'l'];
  const cliOptions: ParseOptions = {
    alias: {
      path: 'p',
      bitratelimit: 'b',
      loglevel: 'l',
    },
    string: validFlags,
    default: { path: '.', bitratelimit: 320, loglevel: 'INFO' },
  };
  const args = parseArgs(Deno.args, cliOptions);

  const validArgsObjectKeys = [...validAliases, ...validFlags, '_'];
  const unrecognizedFlags = Object.keys(args).filter((flag: string) => !validArgsObjectKeys.includes(flag));
  if (unrecognizedFlags.length > 0) {
    throw new Error(
      `Unknown flags passed to audio-scanner: ${unrecognizedFlags.join(', ')}\nPlease refer to the docs for more info.`,
    );
  }

  return args;
}
