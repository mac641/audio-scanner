import * as log from 'jsr:@std/log';
import * as path from 'jsr:@std/path';
import { walk } from 'jsr:@std/fs/walk';
import { parseArgs, ParseOptions } from 'jsr:@std/cli/parse-args';
import { type IAudioMetadata, parseFile } from 'npm:music-metadata';

// DEFINE FUNCTIONS
async function isMp3BelowBitrate(filePath: string): Promise<boolean> {
  try {
    const metadata: IAudioMetadata = await parseFile(filePath);
    const bitrateKbps = Math.round(metadata.format.bitrate / 1000);

    if (bitrateKbps < args.bitratelimit) {
      return true;
    }
  } catch (err: unknown) {
    log.error(`Error processing ${filePath}: ${(err as Error).message}`);
    Deno.exit(1);
  }

  return false;
}

async function main() {
  const targetDir = args.path;
  log.info(`Scanning directory: ${targetDir}`);
  log.info(`Bitrate limit: ${args.bitratelimit}kbps`);

  if ((await Array.fromAsync(walk(targetDir, { exts: ['.mp3'] }))).length === 0) {
    log.info('no files found');
    Deno.exit(0);
  }

  for await (const dirEntry of walk(targetDir, { includeFiles: false, includeSymlinks: false })) {
    for await (
      const entry of walk(dirEntry.path, { exts: ['.mp3'], includeSymlinks: false, includeDirs: false, maxDepth: 1 })
    ) {
      const isFileBelowBitrate = await isMp3BelowBitrate(entry.path);
      if (isFileBelowBitrate) {
        if (log.getLogger().levelName !== 'DEBUG') {
          const basePath = path.dirname(entry.path);
          log.info(`"${basePath}" contains at least one file below ${args.bitratelimit}kbps`);

          break;
        }

        log.debug(`"${entry.path}" is below ${args.bitratelimit}kbps`);
      }
    }
  }
}

// PARSE CLI FLAGS
const cliOptions: ParseOptions = {
  alias: {
    path: 'p',
    bitratelimit: 'b',
    loglevel: 'l',
  },
  string: ['path', 'loglevel'],
  number: ['bitratelimit'],
  default: { path: '.', bitratelimit: 320, loglevel: 'INFO' },
  stopEarly: true,
};
const args = parseArgs(Deno.args, cliOptions);

// SET UP LOGGING
const logLevels = [
  'DEBUG',
  'INFO',
  'ERROR',
];
if (!logLevels.includes(args.loglevel)) {
  log.error(`Log level ${args.loglevel} not found`);
  Deno.exit(1);
}
log.setup({
  handlers: {
    console: new log.ConsoleHandler(args.loglevel),
  },
  loggers: {
    default: {
      level: args.loglevel,
      handlers: ['console'],
    },
  },
});

// RUN PROGRAM
main().catch(log.error);
