# audio-scanner

This repo contains a small typescript app using [Deno](https://deno.com/) to scan for audio files below a given bitrate.

## Getting started

1. [Install deno](https://docs.deno.com/runtime/getting_started/installation/).
2. Execute the script by specifying the `path`, `bitratelimit` and `loglevel`.

```bash
# this is an example:
deno run --allow-read --allow-env main.ts --path /music/ --bitratelimit 128 --loglevel INFO
```

## Compile to binary

_Deno_ allows to compile projects to binaries. Use `deno compile` in order to do so.

```bash
mkdir -p bin/
deno compile --allow-read --allow-env --output bin/audio-scanner main.ts
```

## Configuration

All flags have defaults and are optional.

### `--bitratelimit`

Bitratelimit must be of type `number`. The scanner will detect files that are below the given bitrate.

**Alias**: `-b`

**Default**: `320`

### `--path`

Path must be of type `string` pointing to an existing directory.

**Alias**: `-p`

**Default**: `'.'`

### `--loglevel`

Log level must be of type `string`. Available log levels are `ERROR`, `INFO` and `DEBUG`. Log levels are case-sensitive.

**Alias**: `-l`

**Default**: `'INFO'`
