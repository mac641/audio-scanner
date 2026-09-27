# audio-scanner

This repo contains a small typescript app using [Deno](https://deno.com/) to scan for audio files below a given bitrate.

## Getting started

1. [Install deno](https://docs.deno.com/runtime/getting_started/installation/).
2. Execute the script by passing the search `path` as the **last argument**, plus the _optional_ `bitratelimit` and
   `loglevel` flags.

```bash
# this is an example:
deno run --allow-read --allow-env main.ts --bitratelimit 128 --loglevel INFO /music/
```

Exactly one path is accepted per invocation. Passing more than one exits with an error.

## Compile to binary

_Deno_ allows to compile projects to binaries. Use `deno compile` in order to do so.

```bash
mkdir -p bin/
deno compile --allow-read --allow-env --output bin/audio-scanner main.ts
```

The binary takes the same arguments as `deno run`:

```bash
bin/audio-scanner --bitratelimit 128 /music/
```

## Configuration

The search `path` is required and must be given as the last argument. All flags have defaults and are optional.

### `<path>`

Path must be of type `string` pointing to an existing directory. It is passed positionally, not as a flag.

**Example**: `audio-scanner -b 128 /music/`

### `--bitratelimit`

Bitratelimit must be of type `number`. The scanner will detect files that are below the given bitrate.

**Alias**: `-b`

**Default**: `320`

### `--help`

Help is of type boolean. The scanner will print usage info to the console.

### `--loglevel`

Log level must be of type `string`. Available log levels are `ERROR`, `INFO` and `DEBUG`. Log levels are case-sensitive.

**Alias**: `-l`

**Default**: `'INFO'`
