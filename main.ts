import * as path from 'jsr:@std/path';
import { walk } from 'jsr:@std/fs/walk';
import { parseArgs, ParseOptions } from 'jsr:@std/cli/parse-args';
import { type IAudioMetadata, parseFile } from 'npm:music-metadata';

// TODO: add option to configure log level -> default print dirname if at least one file is below bitrate
// - make configurable to print every path of every file below bitrate
const cliOptions: ParseOptions = {
  alias: {
    path: 'p',
    bitratelimit: 'b',
  },
  string: ['path'],
  number: ['bitratelimit'],
  default: { path: '.', bitratelimit: 320 },
  stopEarly: true,
};
const args = parseArgs(Deno.args, cliOptions);

async function isMp3BelowBitrate(filePath: string): Promise<boolean> {
  try {
    const metadata: IAudioMetadata = await parseFile(filePath);
    const bitrateKbps = Math.round(metadata.format.bitrate / 1000);

    if (bitrateKbps < args.bitratelimit) {
      return true;
    }
  } catch (err: unknown) {
    console.error(`Error processing ${filePath}: ${(err as Error).message}`);
    Deno.exit(1);
  }

  return false;
}

async function main() {
  const targetDir = args.path;
  console.log(`Scanning directory: ${targetDir}`);
  console.log(`Bitrate limit: ${args.bitratelimit}kbps`);
  console.log('');

  if ((await Array.fromAsync(walk(targetDir, { exts: ['.mp3'] }))).length === 0) {
    console.log('no files found');
    Deno.exit(0);
  }

  for await (const dirEntry of walk(targetDir, { includeFiles: false, includeSymlinks: false })) {
    for await (
      const entry of walk(dirEntry.path, { exts: ['.mp3'], includeSymlinks: false, includeDirs: false, maxDepth: 1 })
    ) {
      const isFileBelowBitrate = await isMp3BelowBitrate(entry.path);
      if (isFileBelowBitrate) {
        const basePath = path.dirname(entry.path);
        console.log(`"${basePath}" contains at least one file below ${args.bitratelimit}kbps`);

        // TODO: only print this if log level is debug
        console.debug(`filename: ${entry.path}`);

        console.log('');
        break;
      }
    }
  }
}

main().catch(console.error);
