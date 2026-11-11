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
  const targetDirStats = await Deno.stat(targetDir).catch((err: unknown) => {
    if (err instanceof Deno.errors.NotFound) {
      return null;
    }
    throw err;
  });
  if (targetDirStats === null || !targetDirStats.isDirectory) {
    log.error(`"${targetDir}" is not an existing directory`);
    Deno.exit(1);
  }

  log.info(`Scanning directory: ${targetDir}`);
  log.info(`Bitrate limit: ${args.bitratelimit}kbps`);

  const hasMp3Files = !(await walk(targetDir, { exts: ['.mp3'] })[Symbol.asyncIterator]().next()).done;
  if (!hasMp3Files) {
    log.warn('no files found');
    Deno.exit(0);
  }

  const resolvedTargetDir = path.resolve(targetDir);
  for await (const dirEntry of walk(targetDir, { includeFiles: false, includeSymlinks: false })) {
    const entries = await Array.fromAsync(
      walk(dirEntry.path, { exts: ['.mp3'], includeSymlinks: false, includeDirs: false, maxDepth: 1 }),
    );
    // files are listed individually in the base directory, since listing the base directory itself is useless, and in
    // directories with a single file, since "contains at least one file" makes no sense there
    const listFilesIndividually = entries.length === 1 || path.resolve(dirEntry.path) === resolvedTargetDir;
    for (const entry of entries) {
      const isFileBelowBitrate = await isMp3BelowBitrate(entry.path);
      if (isFileBelowBitrate) {
        if (log.getLogger().levelName === 'DEBUG') {
          log.debug(`"${entry.path}" is below ${args.bitratelimit}kbps`);
          continue;
        }

        if (listFilesIndividually) {
          log.info(`"${entry.path}" is below ${args.bitratelimit}kbps`);
          continue;
        }

        const basePath = path.dirname(entry.path);
        log.info(`"${basePath}" contains at least one file below ${args.bitratelimit}kbps`);

        break;
      }
    }
  }
}

// RUN PROGRAM
const args = parse();

setup(args);

main().catch(log.error);
