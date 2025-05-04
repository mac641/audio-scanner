# audio-scanner

This repo contains a small typescript app using [Deno](https://deno.com/) to scan for audio files below a given bitrate.

## Getting started

1. If not already done, [install deno](https://docs.deno.com/runtime/getting_started/installation/).
2. Execute the script by specifying the `path` and `bitratelimit`.

```bash
# this is an example:
deno run --allow-read --allow-env main.ts --path /music/ --bitratelimit 128
```
