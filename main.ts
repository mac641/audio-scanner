import * as log from '@std/log';
import * as path from '@std/path';
import { walk } from '@std/fs/walk';
import { type IAudioMetadata, parseFile } from 'music-metadata';
import parse from './cli.ts';
import setup from './logger.ts';

// DEFINE FUNCTIONS
async function isMp3BelowBitrate(filePath: string): Promise<boolean> {
  try {
    const metadata: IAudioMetadata = await parseFile(filePath);
    const metadataBitrate = metadata.format.bitrate;
    if (metadataBitrate === undefined) {
      log.error(`could not get bitrate from ${filePath}`);
      Deno.exit(1);
    }
    const bitrateKbps = Math.round(metadataBitrate / 1000);

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
  const targetDirStats = await Deno.stat(targetDir).catch(() => null);
  if (targetDirStats === null || !targetDirStats.isDirectory) {
    log.error(`"${targetDir}" is not an existing directory`);
    Deno.exit(1);
  }

  log.info(`Scanning directory: ${targetDir}`);
  log.info(`Bitrate limit: ${args.bitratelimit}kbps`);

  if ((await Array.fromAsync(walk(targetDir, { exts: ['.mp3'] }))).length === 0) {
    log.warn('no files found');
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

// RUN PROGRAM
const args = parse();

try {
  setup(args);
} catch (err: unknown) {
  log.error(`Error setting up logger: ${(err as Error).message}`);
  Deno.exit(1);
}

main().catch(log.error);
